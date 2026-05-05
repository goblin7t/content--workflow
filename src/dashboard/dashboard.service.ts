import { Injectable } from '@nestjs/common';
import { DraftType, PlatformType, PublishStatus, TopicStatus } from '../common/enums/workflow.enums';
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
    const rawItemById = new Map(data.rawItems.map((item) => [item.id, item]));
    const normalizedItemById = new Map(data.normalizedItems.map((item) => [item.id, item]));
    const sourceById = new Map(data.sources.map((source) => [source.id, source]));

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
        variants: variants.map((variant) => ({
          id: variant.id,
          platform: variant.platform,
          title: variant.title,
          caption: variant.caption,
          hashtags: variant.hashtags,
          status: variant.status,
        })),
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
        ...this.toTopicSummary(topic, normalizedItemById, rawItemById, sourceById),
        id: topic.id,
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

      const primaryItemId = this.getPrimaryTopicNormalizedItemId(topic);
      if (primaryItemId) {
        return normalizedItemsBySourceIds.has(primaryItemId);
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

  private toTopicSummary(
    topic: {
      id: string;
      title: string;
      angle?: string | null;
      summary?: string | null;
      score: number;
      status: TopicStatus;
      createdAt: string;
      clusterPayload: Record<string, unknown>;
    },
    normalizedItemById: Map<string, { rawItemId: string; keywords: string[]; cleanTitle?: string; cleanText?: string; summary?: string }>,
    rawItemById: Map<string, { sourceId: string; title?: string; rawText?: string }>,
    sourceById: Map<string, { name: string; platform: string }>,
  ) {
    const normalizedItemIds = this.getTopicNormalizedItemIds(topic);
    const primaryNormalizedItemId = this.getPrimaryTopicNormalizedItemId(topic);
    const sourceIds = new Set<string>();
    const platforms = new Set<string>();
    const sourceNames = new Set<string>();
    const keywordWeights = new Map<string, number>();
    const candidateItems: Array<{
      id: string;
      isPrimary: boolean;
      title: string;
      summary?: string;
      fullText?: string;
      sourceName: string;
      platform: string;
      keywords: string[];
    }> = [];

    for (const normalizedItemId of normalizedItemIds) {
      const normalizedItem = normalizedItemById.get(normalizedItemId);
      if (!normalizedItem) {
        continue;
      }

      const rawItem = rawItemById.get(normalizedItem.rawItemId);
      if (!rawItem) {
        continue;
      }

      sourceIds.add(rawItem.sourceId);
      const source = sourceById.get(rawItem.sourceId);
      if (source?.platform) {
        platforms.add(source.platform);
      }
      if (source?.name) {
        sourceNames.add(source.name);
      }

      for (const keyword of normalizedItem.keywords ?? []) {
        const normalizedKeyword = this.normalizeTopicKeyword(keyword);
        if (!normalizedKeyword) {
          continue;
        }

        keywordWeights.set(normalizedKeyword, (keywordWeights.get(normalizedKeyword) ?? 0) + 1);
      }

      candidateItems.push({
        id: normalizedItemId,
        isPrimary: normalizedItemId === primaryNormalizedItemId,
        title: normalizedItem.cleanTitle || rawItem.title || '未命名素材',
        summary: normalizedItem.summary || rawItem.rawText?.slice(0, 120),
        fullText: normalizedItem.cleanText || rawItem.rawText,
        sourceName: source?.name || '未知来源',
        platform: source?.platform || 'unknown',
        keywords: (normalizedItem.keywords || []).slice(0, 5),
      });
    }

    const platformList = Array.from(platforms);
    const hotKeywords = [...keywordWeights.entries()]
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .slice(0, 5)
      .map(([keyword]) => keyword);
    return {
      id: topic.id,
      title: topic.title,
      angle: topic.angle ?? undefined,
      summary: topic.summary ?? undefined,
      score: topic.score,
      status: topic.status,
      normalizedItemCount: normalizedItemIds.length,
      createdAt: topic.createdAt,
      sourceCount: sourceIds.size,
      platforms: platformList,
      sourceNames: Array.from(sourceNames).slice(0, 5),
      hotKeywords,
      candidateItems: candidateItems.slice(0, 10),
      recommendation: this.buildTopicRecommendation(topic.score, sourceIds.size, platformList.length, normalizedItemIds.length),
    };
  }

  private buildTopicRecommendation(
    score: number,
    sourceCount: number,
    platformCount: number,
    normalizedItemCount: number,
  ): string {
    if (score >= 98) {
      return '热度高，建议优先看';
    }

    if (platformCount >= 3) {
      return '跨平台都有动静，值得跟进';
    }

    if (sourceCount >= 3) {
      return '来源较多，信息更完整';
    }

    if (normalizedItemCount >= 3) {
      return '素材集中，适合快速出稿';
    }

    return '信息明确，可以继续判断';
  }

  private normalizeTopicKeyword(keyword: string): string | null {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized || normalized.length < 2) {
      return null;
    }

    const ignored = new Set(['the', 'and', 'for', 'with', 'from', 'into', 'this', 'that', 'are', 'was', 'will']);
    if (ignored.has(normalized)) {
      return null;
    }

    return normalized;
  }

  private getTopicNormalizedItemIds(topic: { clusterPayload: Record<string, unknown> }): string[] {
    const ids = topic.clusterPayload.normalizedItemIds;
    return Array.isArray(ids) ? ids.filter((value): value is string => typeof value === 'string') : [];
  }

  private getPrimaryTopicNormalizedItemId(topic: { clusterPayload: Record<string, unknown> }): string | undefined {
    const value = topic.clusterPayload.primaryNormalizedItemId;
    return typeof value === 'string' ? value : undefined;
  }
}
