import { Injectable } from '@nestjs/common';
import { JobAcceptedResponseDto } from '../common/dto/common.dto';
import { WorkflowStoreService } from '../common/services/workflow-store.service';
import { CreateJobDto, ContentJobDto, ContentJobListResponseDto, ListJobsQueryDto } from './dto/job.dto';
import { JOB_STATUS } from './jobs.constants';

@Injectable()
export class JobsService {
  constructor(private readonly store: WorkflowStoreService) {}

  async listJobs(query: ListJobsQueryDto): Promise<ContentJobListResponseDto> {
    return { items: await this.store.listContentJobs(query) };
  }

  async createJob(body: CreateJobDto): Promise<JobAcceptedResponseDto> {
    const job = await this.store.createContentJob({
      topicId: body.topicId,
      draftId: body.draftId,
      jobType: body.jobType,
      status: JOB_STATUS.QUEUED,
      payload: body.payload ?? {},
    });

    return {
      jobId: job.id,
      status: 'queued',
    };
  }

  async getJob(jobId: string): Promise<ContentJobDto> {
    return this.store.getContentJob(jobId);
  }

  async updateJob(jobId: string, body: Partial<ContentJobDto>): Promise<ContentJobDto> {
    return this.store.updateContentJob(jobId, body);
  }

  async getNextQueuedJob(jobType?: string): Promise<ContentJobDto | null> {
    return this.store.findNextQueuedContentJob(jobType);
  }
}
