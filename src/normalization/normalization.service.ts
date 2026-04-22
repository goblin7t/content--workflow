import { Injectable } from '@nestjs/common';
import { WorkflowStoreService } from '../common/services/workflow-store.service';
import { queueJob, newId, nowIso } from '../common/utils/workflow.helpers';
import { JobAcceptedResponseDto } from '../common/dto/common.dto';
import {
  ListNormalizedItemsQueryDto,
  NormalizedItemDto,
  NormalizedItemListResponseDto,
} from './dto/normalization.dto';

@Injectable()
export class NormalizationService {
  constructor(private readonly store: WorkflowStoreService) {}

  async runNormalization(): Promise<JobAcceptedResponseDto> {
    const rawItems = await this.store.listUnnormalizedRawItems();

    for (const rawItem of rawItems) {
      await this.store.createNormalizedItem({
          id: newId(),
          rawItemId: rawItem.id,
          cleanTitle: rawItem.title,
          cleanText: rawItem.rawText,
          summary: rawItem.rawText?.slice(0, 160),
          entities: [],
          keywords: rawItem.title ? rawItem.title.toLowerCase().split(/\s+/).slice(0, 5) : [],
          dedupeKey: rawItem.contentHash,
          qualityScore: 80,
          topicClusterKey: rawItem.sourceId,
          createdAt: nowIso(),
        });
    }

    return queueJob();
  }

  async listNormalizedItems(query: ListNormalizedItemsQueryDto): Promise<NormalizedItemListResponseDto> {
    return { items: await this.store.listNormalizedItems(query) };
  }

  async getNormalizedItem(normalizedItemId: string): Promise<NormalizedItemDto> {
    return this.store.getNormalizedItem(normalizedItemId);
  }
}
