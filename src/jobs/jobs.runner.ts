import { ConflictException, Injectable } from '@nestjs/common';
import { nowIso } from '../common/utils/workflow.helpers';
import { IngestionService } from '../ingestion/ingestion.service';
import { MetricsService } from '../metrics/metrics.service';
import { ContentJobDto } from './dto/job.dto';
import { JOB_STATUS, JOB_TYPE } from './jobs.constants';
import { JobsService } from './jobs.service';

@Injectable()
export class JobsRunnerService {
  constructor(
    private readonly jobsService: JobsService,
    private readonly ingestionService: IngestionService,
    private readonly metricsService: MetricsService,
  ) {}

  async runJob(jobId: string): Promise<ContentJobDto> {
    const job = await this.jobsService.getJob(jobId);
    if (job.status !== JOB_STATUS.QUEUED) {
      throw new ConflictException(`Only queued jobs can be executed (received: ${job.status})`);
    }

    await this.jobsService.updateJob(job.id, {
      status: JOB_STATUS.RUNNING,
      startedAt: nowIso(),
      errorMessage: undefined,
      finishedAt: undefined,
    });

    try {
      await this.dispatch(job);
      return this.jobsService.updateJob(job.id, {
        status: JOB_STATUS.SUCCEEDED,
        finishedAt: nowIso(),
        errorMessage: undefined,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown job error';
      return this.jobsService.updateJob(job.id, {
        status: JOB_STATUS.FAILED,
        finishedAt: nowIso(),
        errorMessage: message,
      });
    }
  }

  async runNextQueuedJob(jobType?: string): Promise<ContentJobDto | null> {
    const job = await this.jobsService.getNextQueuedJob(jobType);
    if (!job) {
      return null;
    }

    return this.runJob(job.id);
  }

  private async dispatch(job: ContentJobDto): Promise<void> {
    switch (job.jobType) {
      case JOB_TYPE.INGESTION_RUN_ALL_SOURCES:
        await this.ingestionService.executeIngestion();
        return;
      case JOB_TYPE.METRICS_SYNC_ALL:
        await this.metricsService.executeMetricsSync();
        return;
      default:
        throw new Error(`Unsupported job type: ${job.jobType}`);
    }
  }
}
