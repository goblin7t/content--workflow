import { Injectable } from '@nestjs/common';
import { DraftType, PlatformType, PublishStatus } from '../common/enums/workflow.enums';
import { WorkflowStoreService } from '../common/services/workflow-store.service';
import { DashboardOverviewDto, DashboardOverviewQueryDto, DashboardVisualizationDto } from './dto/dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly store: WorkflowStoreService) {}

  async getOverview(query: DashboardOverviewQueryDto): Promise<DashboardOverviewDto> {
    const data = await this.buildDashboardDataset(query);

    return {
      rawItemsCount: data.rawItems.length,
      topicsCount: data.topics.length,
      draftsGenerated: data.drafts.length,
      pendingReviews: data.reviews.filter((task) => task.status === 'pending').length,
      scheduledPublishes: data.publishTasks.filter((task) => Boolean(task.scheduledAt)).length,
      publishedToday: data.publishTasks.filter((task) => {
        if (task.status !== PublishStatus.PUBLISHED || !task.publishedAt) {
          return false;
        }

        return query.date ? task.publishedAt.startsWith(query.date) : true;
      }).length,
    };
  }

  async getVisualization(query: DashboardOverviewQueryDto): Promise<DashboardVisualizationDto> {
    const data = await this.buildDashboardDataset(query);
    const overview = this.toOverview(data, query);

    const metricsByPlatform = new Map<PlatformType, { views: number; likes: number; comments: number }>();
    for (const metric of data.metrics) {
      const current = metricsByPlatform.get(metric.platform) ?? { views: 0, likes: 0, comments: 0 };
      current.views += metric.views;
      current.likes += metric.likes;
      current.comments += metric.comments;
      metricsByPlatform.set(metric.platform, current);
    }

    const visiblePlatforms = data.platformFilter ? [data.platformFilter] : Object.values(PlatformType);
    const platformBreakdown = visiblePlatforms.map((platform) => {
      const platformTasks = data.publishTasks.filter((task) => task.platform === platform);
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

    const draftSummaries = await Promise.all(data.drafts.map(async (draft) => {
      const [assets, variants] = await Promise.all([
        this.store.listAssetsByDraft(draft.id),
        this.store.listChannelVariants({ draftId: draft.id }),
      ]);
      const review = data.reviews.find((task) => task.draftId === draft.id);
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

    const reviewSummaries = data.reviews.map((task) => {
      const draft = data.draftById.get(task.draftId);
      const variants = data.variantsByDraft.get(task.draftId) ?? [];
      return {
        id: task.id,
        draftId: task.draftId,
        draftTitle: draft?.title ?? 'Untitled',
        draftType: draft?.draftType ?? DraftType.SUMMARY,
        status: task.status,
        availablePlatforms: variants.map((variant) => variant.platform),
        scheduledAt: task.scheduledAt,
        approvedAt: task.approvedAt,
        rejectedAt: task.rejectedAt,
      };
    });

    const publishSummaries = await Promise.all(data.publishTasks.map(async (task) => {
      const variant = data.variantById.get(task.channelVariantId) ?? await this.store.getChannelVariant(task.channelVariantId);
      const draft = data.draftById.get(variant.draftId) ?? await this.store.getDraft(variant.draftId);
      return {
        id: task.id,
        channelVariantId: task.channelVariantId,
        draftId: draft.id,
        draftType: draft.draftType,
        platform: task.platform,
        status: task.status,
        draftTitle: draft.title ?? 'Untitled',
        scheduledAt: task.scheduledAt,
        retryCount: task.retryCount,
        errorMessage: task.errorMessage,
        remotePostId: task.remotePostId,
        publishedAt: task.publishedAt,
      };
    }));

    const publishCandidates = query.publishStatus
      ? []
      : data.reviews
        .filter((task) => task.status === 'approved')
        .flatMap((task) => {
          const draft = data.draftById.get(task.draftId);
          if (!draft) {
            return [];
          }

          const variants = data.variantsByDraft.get(task.draftId) ?? [];
          return variants
            .filter((variant) => !data.publishTaskVariantIds.has(variant.id))
            .map((variant) => ({
              channelVariantId: variant.id,
              draftId: draft.id,
              draftTitle: draft.title ?? 'Untitled',
              draftType: draft.draftType,
              platform: variant.platform,
              variantStatus: variant.status,
            }));
        });

    return {
      overview,
      totals: {
        normalizedItemsCount: data.normalizedItems.length,
        reviewsCount: data.reviews.length,
        publishTasksCount: data.publishTasks.length,
        totalViews: data.metrics.reduce((sum, metric) => sum + metric.views, 0),
      },
      sources: data.sources.map((source) => ({
        id: source.id,
        name: source.name,
        type: source.type,
        platform: source.platform,
        status: source.status,
        config: source.config,
        lastSyncedAt: source.lastSyncedAt,
        createdAt: source.createdAt,
        updatedAt: source.updatedAt,
        rawItemsCount: data.rawItems.filter((item) => item.sourceId === source.id).length,
      })),
      topics: data.topics.map((topic) => ({
        id: topic.id,
        title: topic.title,
        angle: topic.angle,
        summary: topic.summary,
        score: topic.score,
        status: topic.status,
        normalizedItemCount: this.getTopicNormalizedItemIds(topic).length,
      })),
      drafts: draftSummaries,
      reviews: reviewSummaries,
      publishes: publishSummaries,
      publishCandidates,
      platformBreakdown,
      jobs: data.jobs.map((job) => ({
        id: job.id,
        topicId: job.topicId,
        draftId: job.draftId,
        jobType: job.jobType,
        status: job.status,
        payload: job.payload,
        errorMessage: job.errorMessage,
        startedAt: job.startedAt,
        finishedAt: job.finishedAt,
        createdAt: job.createdAt,
      })),
    };
  }

  private toOverview(
    data: Awaited<ReturnType<DashboardService['buildDashboardDataset']>>,
    query: DashboardOverviewQueryDto,
  ): DashboardOverviewDto {
    return {
      rawItemsCount: data.rawItems.length,
      topicsCount: data.topics.length,
      draftsGenerated: data.drafts.length,
      pendingReviews: data.reviews.filter((task) => task.status === 'pending').length,
      scheduledPublishes: data.publishTasks.filter((task) => Boolean(task.scheduledAt)).length,
      publishedToday: data.publishTasks.filter((task) => {
        if (task.status !== PublishStatus.PUBLISHED || !task.publishedAt) {
          return false;
        }

        return query.date ? task.publishedAt.startsWith(query.date) : true;
      }).length,
    };
  }

  private async buildDashboardDataset(query: DashboardOverviewQueryDto) {
    const platformFilter = this.resolvePlatformFilter(query.platform);
    const hasSourceFilter = Boolean(query.platform || query.sourceStatus);
    const hasTopicFilter = Boolean(query.date || query.topicStatus || hasSourceFilter);
    const hasDraftLineageFilter = hasTopicFilter || Boolean(query.draftStatus);
    const hasPublishLineageFilter = hasDraftLineageFilter || Boolean(query.reviewStatus || query.publishStatus || platformFilter);

    const [
      sources,
      allRawItems,
      allNormalizedItems,
      topicsByQuery,
      draftsByStatus,
      reviewsByStatus,
      publishTasksByQuery,
      allPublishTasks,
      metricsByQuery,
      jobs,
    ] = await Promise.all([
      this.store.listSources({
        platform: query.platform,
        status: query.sourceStatus,
      }),
      this.store.listRawItems({}),
      this.store.listNormalizedItems({}),
      this.store.listTopics({
        date: query.date,
        status: query.topicStatus,
      }),
      this.store.listDrafts({
        status: query.draftStatus,
      }),
      this.store.listReviewTasks({
        status: query.reviewStatus,
      }),
      this.store.listPublishTasks({
        status: query.publishStatus,
        platform: platformFilter,
      }),
      this.store.listPublishTasks({}),
      this.store.listMetrics({
        platform: platformFilter,
      }),
      this.store.listContentJobs({}),
    ]);

    const sourceIds = new Set(sources.map((source) => source.id));
    const rawItems = hasSourceFilter
      ? allRawItems.filter((item) => sourceIds.has(item.sourceId))
      : allRawItems;

    const rawItemIds = new Set(rawItems.map((item) => item.id));
    const normalizedItemsBySource = hasSourceFilter
      ? allNormalizedItems.filter((item) => rawItemIds.has(item.rawItemId))
      : allNormalizedItems;
    const normalizedItemsBySourceIds = new Set(normalizedItemsBySource.map((item) => item.id));

    const topics = topicsByQuery.filter((topic) => {
      if (!hasSourceFilter) {
        return true;
      }

      return this.getTopicNormalizedItemIds(topic).some((itemId) => normalizedItemsBySourceIds.has(itemId));
    });
    const topicIds = new Set(topics.map((topic) => topic.id));

    const variantsByDraft = new Map<string, Awaited<ReturnType<WorkflowStoreService['listChannelVariants']>>[number][]>();
    await Promise.all(draftsByStatus.map(async (draft) => {
      variantsByDraft.set(draft.id, await this.store.listChannelVariants({ draftId: draft.id }));
    }));

    const drafts = draftsByStatus.filter((draft) => {
      if (hasTopicFilter && !topicIds.has(draft.topicId)) {
        return false;
      }

      if (platformFilter) {
        const variants = variantsByDraft.get(draft.id) ?? [];
        return variants.some((variant) => variant.platform === platformFilter);
      }

      return true;
    });
    const draftIds = new Set(drafts.map((draft) => draft.id));
    const draftById = new Map(drafts.map((draft) => [draft.id, draft]));

    const reviews = reviewsByStatus.filter((task) => !hasDraftLineageFilter || draftIds.has(task.draftId));

    const variantById = new Map<string, Awaited<ReturnType<WorkflowStoreService['getChannelVariant']>>>();
    await Promise.all(publishTasksByQuery.map(async (task) => {
      variantById.set(task.channelVariantId, await this.store.getChannelVariant(task.channelVariantId));
    }));

    const publishTasks = publishTasksByQuery.filter((task) => {
      if (!hasPublishLineageFilter) {
        return true;
      }

      const variant = variantById.get(task.channelVariantId);
      return Boolean(variant && draftIds.has(variant.draftId));
    });
    const publishTaskIds = new Set(publishTasks.map((task) => task.id));
    const publishTaskVariantIds = new Set(allPublishTasks.map((task) => task.channelVariantId));

    const metrics = metricsByQuery.filter((metric) => publishTaskIds.has(metric.publishTaskId));

    const normalizedItems = hasTopicFilter
      ? normalizedItemsBySource.filter((item) =>
          topics.some((topic) => this.getTopicNormalizedItemIds(topic).includes(item.id)),
        )
      : normalizedItemsBySource;

    return {
      platformFilter,
      sources,
      rawItems,
      normalizedItems,
      topics,
      drafts,
      reviews,
      publishTasks,
      metrics,
      jobs,
      variantsByDraft,
      variantById,
      draftById,
      publishTaskVariantIds,
    };
  }

  private resolvePlatformFilter(platform?: string): PlatformType | undefined {
    if (!platform) {
      return undefined;
    }

    return Object.values(PlatformType).includes(platform as PlatformType)
      ? (platform as PlatformType)
      : undefined;
  }

  private getTopicNormalizedItemIds(topic: { clusterPayload: Record<string, unknown> }): string[] {
    const ids = topic.clusterPayload.normalizedItemIds;
    return Array.isArray(ids) ? ids.filter((value): value is string => typeof value === 'string') : [];
  }
}
