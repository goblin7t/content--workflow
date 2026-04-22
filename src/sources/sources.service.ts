import { Injectable } from '@nestjs/common';
import { JobAcceptedResponseDto } from '../common/dto/common.dto';
import { queueJob, nowIso } from '../common/utils/workflow.helpers';
import { WorkflowStoreService } from '../common/services/workflow-store.service';
import {
  CreateSourceDto,
  ListSourcesQueryDto,
  SourceDto,
  SourceListResponseDto,
  UpdateSourceDto,
} from './dto/source.dto';

@Injectable()
export class SourcesService {
  constructor(private readonly store: WorkflowStoreService) {}

  async listSources(query: ListSourcesQueryDto): Promise<SourceListResponseDto> {
    return { items: await this.store.listSources(query) };
  }

  async createSource(body: CreateSourceDto): Promise<SourceDto> {
    return this.store.createSource(body);
  }

  async getSource(sourceId: string): Promise<SourceDto> {
    return this.store.getSource(sourceId);
  }

  async updateSource(sourceId: string, body: UpdateSourceDto): Promise<SourceDto> {
    return this.store.updateSource(sourceId, body);
  }

  async syncSource(sourceId: string): Promise<JobAcceptedResponseDto> {
    await this.store.markSourceSynced(sourceId, nowIso());
    return queueJob();
  }
}
