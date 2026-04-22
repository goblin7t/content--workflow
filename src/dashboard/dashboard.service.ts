import { Injectable } from '@nestjs/common';
import { PlatformType, PublishStatus } from '../common/enums/workflow.enums';
import { WorkflowStoreService } from '../common/services/workflow-store.service';
import { DashboardOverviewDto, DashboardOverviewQueryDto, DashboardVisualizationDto } from './dto/dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly store: WorkflowStoreService) {}

  async getOverview(query: DashboardOverviewQueryDto): Promise<DashboardOverviewDto> {
    return {
      rawItemsCount: await this.store.countRawItems(),
      topicsCount: await this.store.countTopics(),
      draftsGenerated: await this.store.countDrafts(),
      pendingReviews: await this.store.countPendingReviews(),
      scheduledPublishes: await this.store.countScheduledPublishes(),
      publishedToday: await this.store.countPublishedToday(query.date),
    };
  }

  async getVisualization(query: DashboardOverviewQueryDto): Promise<DashboardVisualizationDto> {
    const [
      overview,
      sources,
      topics,
      drafts,
      reviews,
      publishTasks,
      metrics,
      normalizedItems,
    ] = await Promise.all([
      this.getOverview(query),
      this.store.listSources({}),
      this.store.listTopics({ date: query.date }),
      this.store.listDrafts({}),
      this.store.listReviewTasks({}),
      this.store.listPublishTasks({}),
      this.store.listMetrics({}),
      this.store.listNormalizedItems({}),
    ]);

    const metricsByPlatform = new Map<PlatformType, { views: number; likes: number; comments: number }>();
    for (const metric of metrics) {
      const current = metricsByPlatform.get(metric.platform) ?? { views: 0, likes: 0, comments: 0 };
      current.views += metric.views;
      current.likes += metric.likes;
      current.comments += metric.comments;
      metricsByPlatform.set(metric.platform, current);
    }

    const platformBreakdown = Object.values(PlatformType).map((platform) => {
      const platformTasks = publishTasks.filter((task) => task.platform === platform);
      const platformMetrics = metricsByPlatform.get(platform) ?? { views: 0, likes: 0, comments: 0 };
      return {
        platform,
        publishTasks: platformTasks.length,
        published: platformTasks.filter((task) => task.status === PublishStatus.PUBLISHED).length,
        failed: platformTasks.filter((task) => task.status === PublishStatus.FAILED).length,
        queued: platformTasks.filter((task) => task.status === PublishStatus.QUEUED).length,
        views: platformMetrics.views,
        likes: platformMetrics.likes,
        comments: platformMetrics.comments,
      };
    });

    const draftSummaries = await Promise.all(drafts.map(async (draft) => {
      const [assets, variants] = await Promise.all([
        this.store.listAssetsByDraft(draft.id),
        this.store.listChannelVariants({ draftId: draft.id }),
      ]);
      const review = reviews.find((task) => task.draftId === draft.id);
      return {
        id: draft.id,
        title: draft.title ?? 'Untitled',
        draftType: draft.draftType,
        status: draft.status,
        sourceRefCount: draft.sourceRefs.length,
        assetCount: assets.length,
        variantCount: variants.length,
        reviewStatus: review?.status,
      };
    }));

    const publishSummaries = await Promise.all(publishTasks.map(async (task) => {
      const variant = await this.store.getChannelVariant(task.channelVariantId);
      const draft = await this.store.getDraft(variant.draftId);
      return {
        id: task.id,
        platform: task.platform,
        status: task.status,
        draftTitle: draft.title ?? 'Untitled',
        remotePostId: task.remotePostId,
        publishedAt: task.publishedAt,
      };
    }));

    return {
      overview,
      totals: {
        normalizedItemsCount: normalizedItems.length,
        reviewsCount: reviews.length,
        publishTasksCount: publishTasks.length,
        totalViews: metrics.reduce((sum, metric) => sum + metric.views, 0),
      },
      sources: sources.map((source) => ({
        id: source.id,
        name: source.name,
        type: source.type,
        platform: source.platform,
        status: source.status,
        lastSyncedAt: source.lastSyncedAt,
      })),
      topics: topics.map((topic) => ({
        id: topic.id,
        title: topic.title,
        angle: topic.angle,
        score: topic.score,
        status: topic.status,
      })),
      drafts: draftSummaries,
      publishes: publishSummaries,
      platformBreakdown,
    };
  }
}
