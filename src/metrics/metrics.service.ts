import { Injectable } from '@nestjs/common';
import { JobAcceptedResponseDto } from '../common/dto/common.dto';
import { WorkflowStoreService } from '../common/services/workflow-store.service';
import { newId, nowIso, queueJob } from '../common/utils/workflow.helpers';
import { ListMetricsQueryDto, PerformanceMetricListResponseDto } from './dto/metric.dto';

@Injectable()
export class MetricsService {
  constructor(private readonly store: WorkflowStoreService) {}

  async syncMetrics(): Promise<JobAcceptedResponseDto> {
    const publishedTasks = await this.store.listPublishedPublishTasks();

    for (const task of publishedTasks) {
      const previous = await this.store.getLatestPerformanceMetric(task.id);

      await this.store.createPerformanceMetric({
        id: newId(),
        publishTaskId: task.id,
        platform: task.platform,
        views: (previous?.views ?? 0) + 100,
        likes: (previous?.likes ?? 0) + 12,
        comments: (previous?.comments ?? 0) + 3,
        shares: (previous?.shares ?? 0) + 2,
        saves: (previous?.saves ?? 0) + 1,
        clicks: (previous?.clicks ?? 0) + 8,
        capturedAt: nowIso(),
      });
    }

    return queueJob();
  }

  async listMetrics(query: ListMetricsQueryDto): Promise<PerformanceMetricListResponseDto> {
    return { items: await this.store.listMetrics(query) };
  }

  async getPostPerformance(publishTaskId: string): Promise<PerformanceMetricListResponseDto> {
    return {
      items: await this.store.listMetricsByPublishTask(publishTaskId),
    };
  }
}
