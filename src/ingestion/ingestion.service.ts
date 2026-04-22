import { Injectable } from '@nestjs/common';
import { WorkflowStoreService } from '../common/services/workflow-store.service';
import { queueJob, newId, nowIso, syntheticText, syntheticTitle } from '../common/utils/workflow.helpers';
import { JobAcceptedResponseDto } from '../common/dto/common.dto';
import { ListRawItemsQueryDto, RawItemDto, RawItemListResponseDto } from './dto/ingestion.dto';
import { createHash } from 'crypto';

@Injectable()
export class IngestionService {
  constructor(private readonly store: WorkflowStoreService) {}

  async runIngestion(): Promise<JobAcceptedResponseDto> {
    const now = nowIso();
    const activeSources = await this.store.listActiveSources();

    for (const [index, source] of activeSources.entries()) {
      const sequence = (await this.store.countRawItemsBySource(source.id)) + 1;
      const title = syntheticTitle(source.name, sequence);
      const rawText = syntheticText(source.name, sequence);
      const contentHash = createHash('sha256')
        .update(`${source.id}:${title}:${rawText}:${now}:${index}`)
        .digest('hex');

      await this.store.createRawItem({
        id: newId(),
        sourceId: source.id,
        externalId: `${source.platform}-${sequence}`,
        url: `https://example.com/${source.platform}/${sequence}`,
        title,
        rawText,
        rawMedia: [],
        author: source.name,
        fetchedAt: now,
        languageCode: 'zh-CN',
        contentHash,
        createdAt: now,
      });
      await this.store.markSourceSynced(source.id, now);
    }

    return queueJob();
  }

  async listRawItems(query: ListRawItemsQueryDto): Promise<RawItemListResponseDto> {
    return { items: await this.store.listRawItems(query) };
  }

  async getRawItem(rawItemId: string): Promise<RawItemDto> {
    return this.store.getRawItem(rawItemId);
  }
}
