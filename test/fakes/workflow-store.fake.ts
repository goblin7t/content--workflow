import { randomUUID } from 'crypto';
import { AssetDto, UpdateAssetDto } from '../../src/assets/dto/asset.dto';
import {
  ChannelVariantDto,
  ListChannelVariantsQueryDto,
  UpdateChannelVariantDto,
} from '../../src/channel-variants/dto/channel-variant.dto';
import { SourceReferenceDto } from '../../src/common/dto/common.dto';
import {
  DraftStatus,
  PlatformType,
  PublishMode,
  PublishStatus,
  ReviewStatus,
  SourceStatus,
  TopicStatus,
} from '../../src/common/enums/workflow.enums';
import { DraftDto, ListDraftsQueryDto, UpdateDraftDto } from '../../src/drafts/dto/draft.dto';
import { ListRawItemsQueryDto, RawItemDto } from '../../src/ingestion/dto/ingestion.dto';
import { ListMetricsQueryDto, PerformanceMetricDto } from '../../src/metrics/dto/metric.dto';
import { ListNormalizedItemsQueryDto, NormalizedItemDto } from '../../src/normalization/dto/normalization.dto';
import { ListPublishTasksQueryDto, PublishTaskDto } from '../../src/publish/dto/publish.dto';
import { ListReviewTasksQueryDto, ReviewTaskDto } from '../../src/review/dto/review.dto';
import { ContentJobDto, CreateJobDto, ListJobsQueryDto } from '../../src/jobs/dto/job.dto';
import { CreateSourceDto, ListSourcesQueryDto, SourceDto, UpdateSourceDto } from '../../src/sources/dto/source.dto';
import { ListTopicsQueryDto, TopicDto, UpdateTopicDto } from '../../src/topics/dto/topic.dto';

type IdempotencyRecord = {
  requestHash: string;
  publishTaskId: string;
};

const nowIso = () => new Date().toISOString();

export class WorkflowStoreFake {
  private readonly sources: SourceDto[] = [];
  private readonly rawItems: RawItemDto[] = [];
  private readonly normalizedItems: NormalizedItemDto[] = [];
  private readonly topics: TopicDto[] = [];
  private readonly drafts: DraftDto[] = [];
  private readonly assets: AssetDto[] = [];
  private readonly channelVariants: ChannelVariantDto[] = [];
  private readonly reviewTasks: ReviewTaskDto[] = [];
  private readonly publishTasks: PublishTaskDto[] = [];
  private readonly performanceMetrics: PerformanceMetricDto[] = [];
  private readonly contentJobs: ContentJobDto[] = [];
  private readonly publishIdempotency = new Map<string, IdempotencyRecord>();

  async reset(): Promise<void> {
    this.sources.length = 0;
    this.rawItems.length = 0;
    this.normalizedItems.length = 0;
    this.topics.length = 0;
    this.drafts.length = 0;
    this.assets.length = 0;
    this.channelVariants.length = 0;
    this.reviewTasks.length = 0;
    this.publishTasks.length = 0;
    this.performanceMetrics.length = 0;
    this.contentJobs.length = 0;
    this.publishIdempotency.clear();
  }

  async listSources(query: ListSourcesQueryDto): Promise<SourceDto[]> {
    return this.sources.filter((source) => {
      if (query.platform && source.platform !== query.platform) {
        return false;
      }
      if (query.status && source.status !== query.status) {
        return false;
      }
      return true;
    });
  }

  async createSource(body: CreateSourceDto): Promise<SourceDto> {
    const now = nowIso();
    const source: SourceDto = {
      id: randomUUID(),
      name: body.name,
      type: body.type,
      platform: body.platform,
      config: body.config,
      status: body.status ?? SourceStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };
    this.sources.push(source);
    return source;
  }

  async getSource(sourceId: string): Promise<SourceDto> {
    const source = this.sources.find((item) => item.id === sourceId);
    if (!source) {
      throw new Error(`Source ${sourceId} not found`);
    }
    return source;
  }

  async updateSource(sourceId: string, body: UpdateSourceDto): Promise<SourceDto> {
    const source = await this.getSource(sourceId);
    Object.assign(source, body, { updatedAt: nowIso() });
    return source;
  }

  async markSourceSynced(sourceId: string, syncedAt: string): Promise<SourceDto> {
    const source = await this.getSource(sourceId);
    source.lastSyncedAt = syncedAt;
    source.updatedAt = syncedAt;
    return source;
  }

  async listActiveSources(): Promise<SourceDto[]> {
    return this.sources.filter((source) => source.status === SourceStatus.ACTIVE);
  }

  async countRawItemsBySource(sourceId: string): Promise<number> {
    return this.rawItems.filter((item) => item.sourceId === sourceId).length;
  }

  async createRawItem(data: Omit<RawItemDto, 'createdAt'> & { createdAt?: string }): Promise<RawItemDto> {
    const item: RawItemDto = {
      ...data,
      createdAt: data.createdAt ?? nowIso(),
    };
    this.rawItems.push(item);
    return item;
  }

  async listRawItems(query: ListRawItemsQueryDto): Promise<RawItemDto[]> {
    return this.rawItems.filter((item) => !query.sourceId || item.sourceId === query.sourceId);
  }

  async getRawItem(rawItemId: string): Promise<RawItemDto> {
    const item = this.rawItems.find((entry) => entry.id === rawItemId);
    if (!item) {
      throw new Error(`Raw item ${rawItemId} not found`);
    }
    return item;
  }

  async listUnnormalizedRawItems(): Promise<RawItemDto[]> {
    const normalizedIds = new Set(this.normalizedItems.map((item) => item.rawItemId));
    return this.rawItems.filter((item) => !normalizedIds.has(item.id));
  }

  async createNormalizedItem(
    data: Omit<NormalizedItemDto, 'createdAt'> & { createdAt?: string },
  ): Promise<NormalizedItemDto> {
    const item: NormalizedItemDto = {
      ...data,
      createdAt: data.createdAt ?? nowIso(),
    };
    this.normalizedItems.push(item);
    return item;
  }

  async listLatestNormalizedItems(limit: number): Promise<NormalizedItemDto[]> {
    return [...this.normalizedItems]
      .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
      .slice(0, limit);
  }

  async listNormalizedItems(query: ListNormalizedItemsQueryDto): Promise<NormalizedItemDto[]> {
    if (!query.topicId) {
      return [...this.normalizedItems];
    }
    const topic = await this.getTopic(query.topicId);
    const ids = new Set((topic.clusterPayload.normalizedItemIds as string[] | undefined) ?? []);
    return this.normalizedItems.filter((item) => ids.has(item.id));
  }

  async getNormalizedItem(normalizedItemId: string): Promise<NormalizedItemDto> {
    const item = this.normalizedItems.find((entry) => entry.id === normalizedItemId);
    if (!item) {
      throw new Error(`Normalized item ${normalizedItemId} not found`);
    }
    return item;
  }

  async getNormalizedItemsByIds(ids: string[]): Promise<NormalizedItemDto[]> {
    const requested = new Set(ids);
    return this.normalizedItems.filter((item) => requested.has(item.id));
  }

  async listTopics(query: ListTopicsQueryDto): Promise<TopicDto[]> {
    return this.topics.filter((topic) => {
      if (query.date && topic.topicDate !== query.date) {
        return false;
      }
      if (query.status && topic.status !== query.status) {
        return false;
      }
      return true;
    });
  }

  async createTopic(data: {
    id: string;
    topicDate: string;
    title: string;
    angle?: string;
    summary?: string;
    score: number;
    status: TopicDto['status'];
    clusterPayload: Record<string, unknown>;
    normalizedItemIds: string[];
    createdAt?: string;
    updatedAt?: string;
  }): Promise<TopicDto> {
    const topic: TopicDto = {
      id: data.id,
      topicDate: data.topicDate,
      title: data.title,
      angle: data.angle,
      summary: data.summary,
      score: data.score,
      status: data.status,
      clusterPayload: {
        ...data.clusterPayload,
        normalizedItemIds: data.normalizedItemIds,
      },
      createdAt: data.createdAt ?? nowIso(),
      updatedAt: data.updatedAt ?? nowIso(),
    };
    this.topics.push(topic);
    return topic;
  }

  async getTopic(topicId: string): Promise<TopicDto> {
    const topic = this.topics.find((item) => item.id === topicId);
    if (!topic) {
      throw new Error(`Topic ${topicId} not found`);
    }
    return topic;
  }

  async updateTopic(topicId: string, body: UpdateTopicDto): Promise<TopicDto> {
    const topic = await this.getTopic(topicId);
    Object.assign(topic, body, { updatedAt: nowIso() });
    return topic;
  }

  async selectTopic(topicId: string, selectedAt: string): Promise<TopicDto> {
    const topic = await this.getTopic(topicId);
    topic.status = TopicStatus.SELECTED;
    topic.selectedAt = selectedAt;
    topic.updatedAt = selectedAt;
    return topic;
  }

  async rejectTopic(topicId: string): Promise<TopicDto> {
    const topic = await this.getTopic(topicId);
    topic.status = TopicStatus.REJECTED;
    topic.updatedAt = nowIso();
    return topic;
  }

  async listDrafts(query: ListDraftsQueryDto): Promise<DraftDto[]> {
    return this.drafts.filter((draft) => {
      if (query.topicId && draft.topicId !== query.topicId) {
        return false;
      }
      if (query.status && draft.status !== query.status) {
        return false;
      }
      return true;
    });
  }

  async createDraft(data: {
    id: string;
    topicId: string;
    draftType: DraftDto['draftType'];
    languageCode: string;
    tone: string;
    title?: string;
    outline: Record<string, unknown>[];
    body?: string;
    facts: Record<string, unknown>[];
    sourceRefs: SourceReferenceDto[];
    version: number;
    status: DraftStatus;
    createdAt?: string;
    updatedAt?: string;
  }): Promise<DraftDto> {
    const draft: DraftDto = {
      id: data.id,
      topicId: data.topicId,
      draftType: data.draftType,
      languageCode: data.languageCode,
      tone: data.tone,
      title: data.title,
      outline: data.outline,
      body: data.body,
      facts: data.facts,
      sourceRefs: data.sourceRefs,
      version: data.version,
      status: data.status,
      createdAt: data.createdAt ?? nowIso(),
      updatedAt: data.updatedAt ?? nowIso(),
    };
    this.drafts.push(draft);
    return draft;
  }

  async getDraft(draftId: string): Promise<DraftDto> {
    const draft = this.drafts.find((item) => item.id === draftId);
    if (!draft) {
      throw new Error(`Draft ${draftId} not found`);
    }
    return draft;
  }

  async updateDraft(
    draftId: string,
    body: UpdateDraftDto & Partial<Pick<DraftDto, 'status' | 'version'>>,
  ): Promise<DraftDto> {
    const draft = await this.getDraft(draftId);
    Object.assign(draft, body, { updatedAt: nowIso() });
    return draft;
  }

  async createReviewTask(data: {
    draftId: string;
    reviewerId?: string;
    status: ReviewStatus;
    comments?: string;
    scheduledAt?: string;
    approvedAt?: string;
    rejectedAt?: string;
  }): Promise<ReviewTaskDto> {
    const task: ReviewTaskDto = {
      id: randomUUID(),
      draftId: data.draftId,
      reviewerId: data.reviewerId,
      status: data.status,
      comments: data.comments,
      scheduledAt: data.scheduledAt,
      approvedAt: data.approvedAt,
      rejectedAt: data.rejectedAt,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    this.reviewTasks.push(task);
    return task;
  }

  async listReviewTasks(query: ListReviewTasksQueryDto): Promise<ReviewTaskDto[]> {
    return this.reviewTasks.filter((task) => {
      if (query.reviewerId && task.reviewerId !== query.reviewerId) {
        return false;
      }
      if (query.status && task.status !== query.status) {
        return false;
      }
      return true;
    });
  }

  async getReviewTask(reviewTaskId: string): Promise<ReviewTaskDto> {
    const task = this.reviewTasks.find((item) => item.id === reviewTaskId);
    if (!task) {
      throw new Error(`Review task ${reviewTaskId} not found`);
    }
    return task;
  }

  async findReviewTaskByDraft(draftId: string): Promise<ReviewTaskDto | null> {
    return this.reviewTasks.find((task) => task.draftId === draftId) ?? null;
  }

  async updateReviewTask(reviewTaskId: string, data: Partial<ReviewTaskDto>): Promise<ReviewTaskDto> {
    const task = await this.getReviewTask(reviewTaskId);
    Object.assign(task, data, { updatedAt: nowIso() });
    return task;
  }

  async createAsset(data: Omit<AssetDto, 'createdAt'> & { createdAt?: string }): Promise<AssetDto> {
    const asset: AssetDto = {
      ...data,
      createdAt: data.createdAt ?? nowIso(),
    };
    this.assets.push(asset);
    return asset;
  }

  async listAssetsByDraft(draftId: string): Promise<AssetDto[]> {
    return this.assets
      .filter((asset) => asset.draftId === draftId)
      .sort((left, right) => (left.pageNo ?? 0) - (right.pageNo ?? 0));
  }

  async getAsset(assetId: string): Promise<AssetDto> {
    const asset = this.assets.find((item) => item.id === assetId);
    if (!asset) {
      throw new Error(`Asset ${assetId} not found`);
    }
    return asset;
  }

  async updateAsset(assetId: string, body: UpdateAssetDto): Promise<AssetDto> {
    const asset = await this.getAsset(assetId);
    Object.assign(asset, body);
    return asset;
  }

  async listChannelVariants(query: ListChannelVariantsQueryDto): Promise<ChannelVariantDto[]> {
    return this.channelVariants.filter((variant) => {
      if (query.draftId && variant.draftId !== query.draftId) {
        return false;
      }
      if (query.platform && variant.platform !== query.platform) {
        return false;
      }
      return true;
    });
  }

  async createChannelVariant(data: {
    draftId: string;
    platform: PlatformType;
    title?: string;
    caption?: string;
    hashtags: string[];
    coverAssetId?: string;
    assetBundle: string[];
    publishMode: PublishMode;
    status: string;
    createdAt?: string;
    updatedAt?: string;
  }): Promise<ChannelVariantDto> {
    const variant: ChannelVariantDto = {
      id: randomUUID(),
      draftId: data.draftId,
      platform: data.platform,
      title: data.title,
      caption: data.caption,
      hashtags: data.hashtags,
      coverAssetId: data.coverAssetId,
      assetBundle: data.assetBundle,
      publishMode: data.publishMode,
      status: data.status,
      createdAt: data.createdAt ?? nowIso(),
      updatedAt: data.updatedAt ?? nowIso(),
    };
    this.channelVariants.push(variant);
    return variant;
  }

  async findChannelVariantByDraftAndPlatform(
    draftId: string,
    platform: PlatformType,
  ): Promise<ChannelVariantDto | null> {
    return this.channelVariants.find((item) => item.draftId === draftId && item.platform === platform) ?? null;
  }

  async getChannelVariant(channelVariantId: string): Promise<ChannelVariantDto> {
    const variant = this.channelVariants.find((item) => item.id === channelVariantId);
    if (!variant) {
      throw new Error(`Channel variant ${channelVariantId} not found`);
    }
    return variant;
  }

  async updateChannelVariant(
    channelVariantId: string,
    body: UpdateChannelVariantDto,
  ): Promise<ChannelVariantDto> {
    const variant = await this.getChannelVariant(channelVariantId);
    Object.assign(variant, body, { updatedAt: nowIso() });
    return variant;
  }

  async listPublishTasks(query: ListPublishTasksQueryDto): Promise<PublishTaskDto[]> {
    return this.publishTasks.filter((task) => {
      if (query.status && task.status !== query.status) {
        return false;
      }
      if (query.platform && task.platform !== query.platform) {
        return false;
      }
      return true;
    });
  }

  async createPublishTask(data: {
    channelVariantId: string;
    platform: PlatformType;
    status: PublishStatus;
    scheduledAt?: string;
    retryCount: number;
    responsePayload: Record<string, unknown>;
  }): Promise<PublishTaskDto> {
    const task: PublishTaskDto = {
      id: randomUUID(),
      channelVariantId: data.channelVariantId,
      platform: data.platform,
      status: data.status,
      scheduledAt: data.scheduledAt,
      retryCount: data.retryCount,
      responsePayload: data.responsePayload,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    this.publishTasks.push(task);
    return task;
  }

  async getPublishTask(publishTaskId: string): Promise<PublishTaskDto> {
    const task = this.publishTasks.find((item) => item.id === publishTaskId);
    if (!task) {
      throw new Error(`Publish task ${publishTaskId} not found`);
    }
    return task;
  }

  async updatePublishTask(publishTaskId: string, data: Partial<PublishTaskDto>): Promise<PublishTaskDto> {
    const task = await this.getPublishTask(publishTaskId);
    Object.assign(task, data, { updatedAt: nowIso() });
    return task;
  }

  async listPublishedPublishTasks(): Promise<PublishTaskDto[]> {
    return this.publishTasks.filter((task) => task.status === PublishStatus.PUBLISHED);
  }

  async findPublishIdempotency(
    scope: 'create_task' | 'run_task',
    key: string,
  ): Promise<{ requestHash: string; publishTaskId: string | null } | null> {
    const item = this.publishIdempotency.get(`${scope}:${key}`);
    return item
      ? {
          requestHash: item.requestHash,
          publishTaskId: item.publishTaskId,
        }
      : null;
  }

  async createPublishIdempotency(
    scope: 'create_task' | 'run_task',
    key: string,
    requestHash: string,
    publishTaskId: string,
  ): Promise<void> {
    this.publishIdempotency.set(`${scope}:${key}`, {
      requestHash,
      publishTaskId,
    });
  }

  async createPerformanceMetric(
    data: Omit<PerformanceMetricDto, 'id'> & { id?: string },
  ): Promise<PerformanceMetricDto> {
    const metric: PerformanceMetricDto = {
      ...data,
      id: data.id ?? randomUUID(),
    };
    this.performanceMetrics.push(metric);
    return metric;
  }

  async getLatestPerformanceMetric(publishTaskId: string): Promise<PerformanceMetricDto | null> {
    return (
      [...this.performanceMetrics]
        .filter((metric) => metric.publishTaskId === publishTaskId)
        .sort((left, right) => Date.parse(right.capturedAt) - Date.parse(left.capturedAt))[0] ?? null
    );
  }

  async listMetrics(query: ListMetricsQueryDto): Promise<PerformanceMetricDto[]> {
    return this.performanceMetrics.filter((metric) => {
      if (query.platform && metric.platform !== query.platform) {
        return false;
      }
      if (query.from && Date.parse(metric.capturedAt) < Date.parse(query.from)) {
        return false;
      }
      if (query.to && Date.parse(metric.capturedAt) > Date.parse(query.to)) {
        return false;
      }
      return true;
    });
  }

  async listMetricsByPublishTask(publishTaskId: string): Promise<PerformanceMetricDto[]> {
    return this.performanceMetrics.filter((metric) => metric.publishTaskId === publishTaskId);
  }

  async listContentJobs(query: ListJobsQueryDto): Promise<ContentJobDto[]> {
    return this.contentJobs.filter((job) => {
      if (query.status && job.status !== query.status) {
        return false;
      }
      if (query.jobType && job.jobType !== query.jobType) {
        return false;
      }
      return true;
    });
  }

  async createContentJob(body: CreateJobDto & { status: string; payload: Record<string, unknown> }): Promise<ContentJobDto> {
    const job: ContentJobDto = {
      id: randomUUID(),
      topicId: body.topicId,
      draftId: body.draftId,
      jobType: body.jobType,
      status: body.status,
      payload: body.payload ?? {},
      createdAt: nowIso(),
    };
    this.contentJobs.unshift(job);
    return job;
  }

  async getContentJob(jobId: string): Promise<ContentJobDto> {
    const job = this.contentJobs.find((item) => item.id === jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    return job;
  }

  async updateContentJob(jobId: string, body: Partial<ContentJobDto>): Promise<ContentJobDto> {
    const job = await this.getContentJob(jobId);
    const next = { ...body } as Record<string, unknown>;
    if (next.errorMessage === null) {
      delete job.errorMessage;
      delete next.errorMessage;
    }
    if (next.startedAt === null) {
      delete job.startedAt;
      delete next.startedAt;
    }
    if (next.finishedAt === null) {
      delete job.finishedAt;
      delete next.finishedAt;
    }
    Object.assign(job, next);
    return job;
  }

  async findNextQueuedContentJob(jobType?: string): Promise<ContentJobDto | null> {
    return this.contentJobs.find((job) => job.status === 'queued' && (!jobType || job.jobType === jobType)) ?? null;
  }

  async countRawItems(): Promise<number> {
    return this.rawItems.length;
  }

  async countTopics(): Promise<number> {
    return this.topics.length;
  }

  async countDrafts(): Promise<number> {
    return this.drafts.length;
  }

  async countPendingReviews(): Promise<number> {
    return this.reviewTasks.filter((task) => task.status === ReviewStatus.PENDING).length;
  }

  async countScheduledPublishes(): Promise<number> {
    return this.publishTasks.filter((task) => Boolean(task.scheduledAt)).length;
  }

  async countPublishedToday(date?: string): Promise<number> {
    return this.publishTasks.filter((task) => {
      if (task.status !== PublishStatus.PUBLISHED || !task.publishedAt) {
        return false;
      }
      return date ? task.publishedAt.startsWith(date) : true;
    }).length;
  }
}
