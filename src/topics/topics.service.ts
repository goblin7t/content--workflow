import { Injectable } from '@nestjs/common';
import { WorkflowStoreService } from '../common/services/workflow-store.service';
import { newId, nowIso } from '../common/utils/workflow.helpers';
import { TopicStatus } from '../common/enums/workflow.enums';
import { GenerateTopicsDto, ListTopicsQueryDto, TopicDto, TopicListResponseDto, UpdateTopicDto } from './dto/topic.dto';

@Injectable()
export class TopicsService {
  constructor(private readonly store: WorkflowStoreService) {}

  async listTopics(query: ListTopicsQueryDto): Promise<TopicListResponseDto> {
    return { items: await this.store.listTopics(query) };
  }

  async generateTopics(body: GenerateTopicsDto): Promise<TopicListResponseDto> {
    const targetCount = body.targetSummaryCount + body.targetDeepCount;
    const candidates = await this.store.listLatestNormalizedItems(targetCount);
    const nextItems: TopicDto[] = [];

    for (const [index, item] of candidates.entries()) {
      const rawItem = await this.store.getRawItem(item.rawItemId);
      const title = item.cleanTitle ?? rawItem?.title ?? `Generated topic ${index + 1}`;
      const now = nowIso();

      const topic = await this.store.createTopic({
        id: newId(),
        topicDate: body.date,
        title,
        angle: 'Auto-generated trend angle',
        summary: item.summary ?? rawItem?.rawText?.slice(0, 120),
        score: 100 - index,
        status: TopicStatus.CANDIDATE,
        clusterPayload: {
          normalizedItemIds: [item.id],
          sourceRefCandidates: [
            {
              normalizedItemId: item.id,
              rawItemId: item.rawItemId,
            },
          ],
        },
        normalizedItemIds: [item.id],
        createdAt: now,
        updatedAt: now,
      });
      nextItems.push(topic);
    }

    return { items: nextItems };
  }

  async getTopic(topicId: string): Promise<TopicDto> {
    return this.store.getTopic(topicId);
  }

  async updateTopic(topicId: string, body: UpdateTopicDto): Promise<TopicDto> {
    return this.store.updateTopic(topicId, body);
  }

  async selectTopic(topicId: string): Promise<TopicDto> {
    return this.store.selectTopic(topicId, nowIso());
  }

  async rejectTopic(topicId: string): Promise<TopicDto> {
    return this.store.rejectTopic(topicId);
  }
}
