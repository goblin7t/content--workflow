import { Injectable } from '@nestjs/common';
import { WorkflowStoreService } from '../common/services/workflow-store.service';
import { newId, nowIso, syntheticText, syntheticTitle } from '../common/utils/workflow.helpers';
import { JobAcceptedResponseDto } from '../common/dto/common.dto';
import { ListRawItemsQueryDto, RawItemDto, RawItemListResponseDto } from './dto/ingestion.dto';
import { createHash } from 'crypto';
import { JobsService } from '../jobs/jobs.service';
import { JOB_TYPE } from '../jobs/jobs.constants';

@Injectable()
export class IngestionService {
  constructor(
    private readonly store: WorkflowStoreService,
    private readonly jobsService: JobsService,
  ) {}

  async runIngestion(): Promise<JobAcceptedResponseDto> {
    return this.jobsService.createJob({
      jobType: JOB_TYPE.INGESTION_RUN_ALL_SOURCES,
      payload: {},
    });
  }

  async executeIngestion(): Promise<{ sourcesProcessed: number; rawItemsCreated: number }> {
    const now = nowIso();
    const activeSources = await this.store.listActiveSources();
    let rawItemsCreated = 0;

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
      rawItemsCreated += 1;
      await this.store.markSourceSynced(source.id, now);
    }

    return {
      sourcesProcessed: activeSources.length,
      rawItemsCreated,
    };
  }

  async listRawItems(query: ListRawItemsQueryDto): Promise<RawItemListResponseDto> {
    return { items: await this.store.listRawItems(query) };
  }

  async getRawItem(rawItemId: string): Promise<RawItemDto> {
    return this.store.getRawItem(rawItemId);
  }
}
