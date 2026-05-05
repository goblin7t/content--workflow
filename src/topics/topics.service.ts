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
    const minRelatedItems = Math.min(3, candidates.length);
    const maxRelatedItems = Math.min(10, candidates.length);

    for (const [index, item] of candidates.entries()) {
      const rawItem = await this.store.getRawItem(item.rawItemId);
      const title = item.cleanTitle ?? rawItem?.title ?? `Generated topic ${index + 1}`;
      const now = nowIso();
      const relatedItems = this.pickRelatedItems(candidates, index, minRelatedItems, maxRelatedItems);

      const topic = await this.store.createTopic({
        id: newId(),
        topicDate: body.date,
        title,
        angle: 'Auto-generated trend angle',
        summary: item.summary ?? rawItem?.rawText?.slice(0, 120),
        score: 100 - index,
        status: TopicStatus.CANDIDATE,
        clusterPayload: {
          primaryNormalizedItemId: item.id,
          normalizedItemIds: relatedItems.map((related) => related.id),
          sourceRefCandidates: relatedItems.map((related) => ({
            normalizedItemId: related.id,
            rawItemId: related.rawItemId,
          })),
        },
        normalizedItemIds: relatedItems.map((related) => related.id),
        createdAt: now,
        updatedAt: now,
      });
      nextItems.push(topic);
    }

    return { items: nextItems };
  }

  private pickRelatedItems(items: Array<{ id: string; rawItemId: string }>, index: number, minCount: number, maxCount: number) {
    if (!items.length) {
      return [];
    }

    const targetCount = Math.max(minCount, Math.min(maxCount, minCount + (index % Math.max(1, maxCount - minCount + 1))));
    const selected = [items[index]];
    let offset = 1;

    while (selected.length < targetCount && selected.length < items.length) {
      const left = items[index - offset];
      const right = items[index + offset];
      if (left) {
        selected.push(left);
      }
      if (selected.length < targetCount && right) {
        selected.push(right);
      }
      offset += 1;
    }

    return selected.slice(0, targetCount);
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
