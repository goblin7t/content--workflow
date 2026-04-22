import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AssetType as PrismaAssetType,
  DraftStatus as PrismaDraftStatus,
  DraftType as PrismaDraftType,
  PlatformType as PrismaPlatformType,
  Prisma,
  PublishIdempotencyScope as PrismaPublishIdempotencyScope,
  PublishMode as PrismaPublishMode,
  PublishStatus as PrismaPublishStatus,
  ReviewStatus as PrismaReviewStatus,
  SourceStatus as PrismaSourceStatus,
  SourceType as PrismaSourceType,
  TopicStatus as PrismaTopicStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AssetDto, UpdateAssetDto } from '../../assets/dto/asset.dto';
import { ChannelVariantDto, ListChannelVariantsQueryDto, UpdateChannelVariantDto } from '../../channel-variants/dto/channel-variant.dto';
import { SourceReferenceDto } from '../dto/common.dto';
import {
  AssetType,
  DraftStatus,
  DraftType,
  PlatformType,
  PublishMode,
  PublishStatus,
  ReviewStatus,
  SourceStatus,
  SourceType,
  TopicStatus,
} from '../enums/workflow.enums';
import { DraftDto, ListDraftsQueryDto, UpdateDraftDto } from '../../drafts/dto/draft.dto';
import { RawItemDto, ListRawItemsQueryDto } from '../../ingestion/dto/ingestion.dto';
import { PerformanceMetricDto, ListMetricsQueryDto } from '../../metrics/dto/metric.dto';
import { NormalizedItemDto, ListNormalizedItemsQueryDto } from '../../normalization/dto/normalization.dto';
import { PublishTaskDto, ListPublishTasksQueryDto } from '../../publish/dto/publish.dto';
import { ReviewTaskDto, ListReviewTasksQueryDto } from '../../review/dto/review.dto';
import { CreateSourceDto, ListSourcesQueryDto, SourceDto, UpdateSourceDto } from '../../sources/dto/source.dto';
import { TopicDto, ListTopicsQueryDto, UpdateTopicDto } from '../../topics/dto/topic.dto';

const sourceTypeToDb: Record<SourceType, PrismaSourceType> = {
  [SourceType.RSS]: PrismaSourceType.RSS,
  [SourceType.SOCIAL_API]: PrismaSourceType.SOCIAL_API,
  [SourceType.MANUAL]: PrismaSourceType.MANUAL,
};

const sourceStatusToDb: Record<SourceStatus, PrismaSourceStatus> = {
  [SourceStatus.ACTIVE]: PrismaSourceStatus.ACTIVE,
  [SourceStatus.DISABLED]: PrismaSourceStatus.DISABLED,
};

const topicStatusToDb: Record<TopicStatus, PrismaTopicStatus> = {
  [TopicStatus.CANDIDATE]: PrismaTopicStatus.CANDIDATE,
  [TopicStatus.SELECTED]: PrismaTopicStatus.SELECTED,
  [TopicStatus.REJECTED]: PrismaTopicStatus.REJECTED,
  [TopicStatus.ARCHIVED]: PrismaTopicStatus.ARCHIVED,
};

const draftTypeToDb: Record<DraftType, PrismaDraftType> = {
  [DraftType.SUMMARY]: PrismaDraftType.SUMMARY,
  [DraftType.DEEP]: PrismaDraftType.DEEP,
};

const draftStatusToDb: Record<DraftStatus, PrismaDraftStatus> = {
  [DraftStatus.DRAFT]: PrismaDraftStatus.DRAFT,
  [DraftStatus.RENDERED]: PrismaDraftStatus.RENDERED,
  [DraftStatus.IN_REVIEW]: PrismaDraftStatus.IN_REVIEW,
  [DraftStatus.APPROVED]: PrismaDraftStatus.APPROVED,
  [DraftStatus.REJECTED]: PrismaDraftStatus.REJECTED,
  [DraftStatus.SCHEDULED]: PrismaDraftStatus.SCHEDULED,
  [DraftStatus.PUBLISHED]: PrismaDraftStatus.PUBLISHED,
  [DraftStatus.FAILED]: PrismaDraftStatus.FAILED,
};

const assetTypeToDb: Record<AssetType, PrismaAssetType> = {
  [AssetType.COVER]: PrismaAssetType.COVER,
  [AssetType.PAGE]: PrismaAssetType.PAGE,
  [AssetType.THUMBNAIL]: PrismaAssetType.THUMBNAIL,
};

const platformTypeToDb: Record<PlatformType, PrismaPlatformType> = {
  [PlatformType.XIAOHONGSHU]: PrismaPlatformType.XIAOHONGSHU,
  [PlatformType.DOUYIN]: PrismaPlatformType.DOUYIN,
  [PlatformType.TIKTOK]: PrismaPlatformType.TIKTOK,
  [PlatformType.FACEBOOK]: PrismaPlatformType.FACEBOOK,
};

const publishModeToDb: Record<PublishMode, PrismaPublishMode> = {
  [PublishMode.SEMI_AUTO]: PrismaPublishMode.SEMI_AUTO,
  [PublishMode.DIRECT_API]: PrismaPublishMode.DIRECT_API,
};

const reviewStatusToDb: Record<ReviewStatus, PrismaReviewStatus> = {
  [ReviewStatus.PENDING]: PrismaReviewStatus.PENDING,
  [ReviewStatus.APPROVED]: PrismaReviewStatus.APPROVED,
  [ReviewStatus.REJECTED]: PrismaReviewStatus.REJECTED,
  [ReviewStatus.REGENERATE_REQUESTED]: PrismaReviewStatus.REGENERATE_REQUESTED,
};

const publishStatusToDb: Record<PublishStatus, PrismaPublishStatus> = {
  [PublishStatus.QUEUED]: PrismaPublishStatus.QUEUED,
  [PublishStatus.RUNNING]: PrismaPublishStatus.RUNNING,
  [PublishStatus.PUBLISHED]: PrismaPublishStatus.PUBLISHED,
  [PublishStatus.FAILED]: PrismaPublishStatus.FAILED,
  [PublishStatus.CANCELLED]: PrismaPublishStatus.CANCELLED,
};

const dbToSourceType: Record<string, SourceType> = {
  RSS: SourceType.RSS,
  SOCIAL_API: SourceType.SOCIAL_API,
  MANUAL: SourceType.MANUAL,
};

const dbToSourceStatus: Record<string, SourceStatus> = {
  ACTIVE: SourceStatus.ACTIVE,
  DISABLED: SourceStatus.DISABLED,
};

const dbToTopicStatus: Record<string, TopicStatus> = {
  CANDIDATE: TopicStatus.CANDIDATE,
  SELECTED: TopicStatus.SELECTED,
  REJECTED: TopicStatus.REJECTED,
  ARCHIVED: TopicStatus.ARCHIVED,
};

const dbToDraftType: Record<string, DraftType> = {
  SUMMARY: DraftType.SUMMARY,
  DEEP: DraftType.DEEP,
};

const dbToDraftStatus: Record<string, DraftStatus> = {
  DRAFT: DraftStatus.DRAFT,
  RENDERED: DraftStatus.RENDERED,
  IN_REVIEW: DraftStatus.IN_REVIEW,
  APPROVED: DraftStatus.APPROVED,
  REJECTED: DraftStatus.REJECTED,
  SCHEDULED: DraftStatus.SCHEDULED,
  PUBLISHED: DraftStatus.PUBLISHED,
  FAILED: DraftStatus.FAILED,
};

const dbToAssetType: Record<string, AssetType> = {
  COVER: AssetType.COVER,
  PAGE: AssetType.PAGE,
  THUMBNAIL: AssetType.THUMBNAIL,
};

const dbToPlatformType: Record<string, PlatformType> = {
  XIAOHONGSHU: PlatformType.XIAOHONGSHU,
  DOUYIN: PlatformType.DOUYIN,
  TIKTOK: PlatformType.TIKTOK,
  FACEBOOK: PlatformType.FACEBOOK,
};

const dbToPublishMode: Record<string, PublishMode> = {
  SEMI_AUTO: PublishMode.SEMI_AUTO,
  DIRECT_API: PublishMode.DIRECT_API,
};

const dbToReviewStatus: Record<string, ReviewStatus> = {
  PENDING: ReviewStatus.PENDING,
  APPROVED: ReviewStatus.APPROVED,
  REJECTED: ReviewStatus.REJECTED,
  REGENERATE_REQUESTED: ReviewStatus.REGENERATE_REQUESTED,
};

const dbToPublishStatus: Record<string, PublishStatus> = {
  QUEUED: PublishStatus.QUEUED,
  RUNNING: PublishStatus.RUNNING,
  PUBLISHED: PublishStatus.PUBLISHED,
  FAILED: PublishStatus.FAILED,
  CANCELLED: PublishStatus.CANCELLED,
};

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

@Injectable()
export class WorkflowStoreService {
  constructor(private readonly prisma: PrismaService) {}

  async reset(): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.performanceMetric.deleteMany(),
      this.prisma.publishIdempotencyKey.deleteMany(),
      this.prisma.publishTask.deleteMany(),
      this.prisma.reviewTask.deleteMany(),
      this.prisma.channelVariantAsset.deleteMany(),
      this.prisma.channelVariant.deleteMany(),
      this.prisma.asset.deleteMany(),
      this.prisma.draftSourceReference.deleteMany(),
      this.prisma.contentJob.deleteMany(),
      this.prisma.draft.deleteMany(),
      this.prisma.topicItem.deleteMany(),
      this.prisma.topic.deleteMany(),
      this.prisma.normalizedItem.deleteMany(),
      this.prisma.rawItem.deleteMany(),
      this.prisma.source.deleteMany(),
    ]);
  }

  async listSources(query: ListSourcesQueryDto): Promise<SourceDto[]> {
    const items = await this.prisma.source.findMany({
      where: {
        platform: query.platform,
        status: query.status ? sourceStatusToDb[query.status] : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((item) => this.mapSource(item));
  }

  async createSource(body: CreateSourceDto): Promise<SourceDto> {
    const source = await this.prisma.source.create({
      data: {
        name: body.name,
        type: sourceTypeToDb[body.type],
        platform: body.platform,
        config: toJsonValue(body.config),
        status: sourceStatusToDb[body.status ?? SourceStatus.ACTIVE],
      },
    });
    return this.mapSource(source);
  }

  async getSource(sourceId: string): Promise<SourceDto> {
    const source = await this.prisma.source.findUnique({ where: { id: sourceId } });
    if (!source) {
      throw new NotFoundException(`Source ${sourceId} not found`);
    }
    return this.mapSource(source);
  }

  async updateSource(sourceId: string, body: UpdateSourceDto): Promise<SourceDto> {
    await this.ensureSource(sourceId);
    const source = await this.prisma.source.update({
      where: { id: sourceId },
      data: {
        name: body.name,
        config: body.config ? toJsonValue(body.config) : undefined,
        status: body.status ? sourceStatusToDb[body.status] : undefined,
      },
    });
    return this.mapSource(source);
  }

  async markSourceSynced(sourceId: string, syncedAt: string): Promise<SourceDto> {
    await this.ensureSource(sourceId);
    const source = await this.prisma.source.update({
      where: { id: sourceId },
      data: { lastSyncedAt: new Date(syncedAt) },
    });
    return this.mapSource(source);
  }

  async listActiveSources(): Promise<SourceDto[]> {
    const items = await this.prisma.source.findMany({
      where: { status: sourceStatusToDb[SourceStatus.ACTIVE] },
      orderBy: { createdAt: 'asc' },
    });
    return items.map((item) => this.mapSource(item));
  }

  async countRawItemsBySource(sourceId: string): Promise<number> {
    return this.prisma.rawItem.count({ where: { sourceId } });
  }

  async createRawItem(data: Omit<RawItemDto, 'createdAt'> & { createdAt?: string }): Promise<RawItemDto> {
    const item = await this.prisma.rawItem.create({
      data: {
        id: data.id,
        sourceId: data.sourceId,
        externalId: data.externalId,
        url: data.url,
        title: data.title,
        rawText: data.rawText,
        rawMedia: toJsonValue(data.rawMedia),
        author: data.author,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
        fetchedAt: new Date(data.fetchedAt),
        languageCode: data.languageCode,
        contentHash: data.contentHash,
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      },
    });
    return this.mapRawItem(item);
  }

  async listRawItems(query: ListRawItemsQueryDto): Promise<RawItemDto[]> {
    const items = await this.prisma.rawItem.findMany({
      where: { sourceId: query.sourceId },
      orderBy: { fetchedAt: 'desc' },
    });
    return items.map((item) => this.mapRawItem(item));
  }

  async getRawItem(rawItemId: string): Promise<RawItemDto> {
    const item = await this.prisma.rawItem.findUnique({ where: { id: rawItemId } });
    if (!item) {
      throw new NotFoundException(`Raw item ${rawItemId} not found`);
    }
    return this.mapRawItem(item);
  }

  async listUnnormalizedRawItems(): Promise<RawItemDto[]> {
    const items = await this.prisma.rawItem.findMany({
      where: { normalizedItem: { is: null } },
      orderBy: { fetchedAt: 'asc' },
    });
    return items.map((item) => this.mapRawItem(item));
  }

  async createNormalizedItem(data: Omit<NormalizedItemDto, 'createdAt'> & { createdAt?: string }): Promise<NormalizedItemDto> {
    const item = await this.prisma.normalizedItem.create({
      data: {
        id: data.id,
        rawItemId: data.rawItemId,
        cleanTitle: data.cleanTitle,
        cleanText: data.cleanText,
        summary: data.summary,
        entities: toJsonValue(data.entities),
        keywords: data.keywords,
        dedupeKey: data.dedupeKey,
        qualityScore: data.qualityScore,
        topicClusterKey: data.topicClusterKey,
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      },
    });
    return this.mapNormalizedItem(item);
  }

  async listLatestNormalizedItems(limit: number): Promise<NormalizedItemDto[]> {
    const items = await this.prisma.normalizedItem.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return items.map((item) => this.mapNormalizedItem(item));
  }

  async listNormalizedItems(query: ListNormalizedItemsQueryDto): Promise<NormalizedItemDto[]> {
    const items = await this.prisma.normalizedItem.findMany({
      where: query.topicId ? { topicItems: { some: { topicId: query.topicId } } } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return items.map((item) => this.mapNormalizedItem(item));
  }

  async getNormalizedItem(normalizedItemId: string): Promise<NormalizedItemDto> {
    const item = await this.prisma.normalizedItem.findUnique({ where: { id: normalizedItemId } });
    if (!item) {
      throw new NotFoundException(`Normalized item ${normalizedItemId} not found`);
    }
    return this.mapNormalizedItem(item);
  }

  async getNormalizedItemsByIds(ids: string[]): Promise<NormalizedItemDto[]> {
    if (ids.length === 0) {
      return [];
    }
    const items = await this.prisma.normalizedItem.findMany({ where: { id: { in: ids } } });
    return items.map((item) => this.mapNormalizedItem(item));
  }

  async listTopics(query: ListTopicsQueryDto): Promise<TopicDto[]> {
    const items = await this.prisma.topic.findMany({
      where: {
        topicDate: query.date ? new Date(query.date) : undefined,
        status: query.status ? topicStatusToDb[query.status] : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((item) => this.mapTopic(item));
  }

  async createTopic(data: {
    id: string;
    topicDate: string;
    title: string;
    angle?: string;
    summary?: string;
    score: number;
    status: TopicStatus;
    clusterPayload: Record<string, unknown>;
    normalizedItemIds: string[];
    createdAt?: string;
    updatedAt?: string;
  }): Promise<TopicDto> {
    const topic = await this.prisma.topic.create({
      data: {
        id: data.id,
        topicDate: new Date(data.topicDate),
        title: data.title,
        angle: data.angle,
        summary: data.summary,
        score: data.score,
        status: topicStatusToDb[data.status],
        clusterPayload: toJsonValue(data.clusterPayload),
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
        topicItems: {
          createMany: {
            data: data.normalizedItemIds.map((normalizedItemId) => ({
              normalizedItemId,
            })),
          },
        },
      },
    });
    return this.mapTopic(topic);
  }

  async getTopic(topicId: string): Promise<TopicDto> {
    const topic = await this.prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic) {
      throw new NotFoundException(`Topic ${topicId} not found`);
    }
    return this.mapTopic(topic);
  }

  async updateTopic(topicId: string, body: UpdateTopicDto): Promise<TopicDto> {
    await this.ensureTopic(topicId);
    const topic = await this.prisma.topic.update({
      where: { id: topicId },
      data: {
        title: body.title,
        angle: body.angle,
        summary: body.summary,
        status: body.status ? topicStatusToDb[body.status] : undefined,
      },
    });
    return this.mapTopic(topic);
  }

  async selectTopic(topicId: string, selectedAt: string): Promise<TopicDto> {
    await this.ensureTopic(topicId);
    const topic = await this.prisma.topic.update({
      where: { id: topicId },
      data: {
        status: topicStatusToDb[TopicStatus.SELECTED],
        selectedAt: new Date(selectedAt),
      },
    });
    return this.mapTopic(topic);
  }

  async rejectTopic(topicId: string): Promise<TopicDto> {
    await this.ensureTopic(topicId);
    const topic = await this.prisma.topic.update({
      where: { id: topicId },
      data: { status: topicStatusToDb[TopicStatus.REJECTED] },
    });
    return this.mapTopic(topic);
  }

  async listDrafts(query: ListDraftsQueryDto): Promise<DraftDto[]> {
    const items = await this.prisma.draft.findMany({
      where: {
        topicId: query.topicId,
        status: query.status ? draftStatusToDb[query.status] : undefined,
      },
      include: { sourceReferences: true },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((item) => this.mapDraft(item));
  }

  async createDraft(data: {
    id: string;
    topicId: string;
    draftType: DraftType;
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
    const draft = await this.prisma.draft.create({
      data: {
        id: data.id,
        topicId: data.topicId,
        draftType: draftTypeToDb[data.draftType],
        languageCode: data.languageCode,
        tone: data.tone,
        title: data.title,
        outline: toJsonValue(data.outline),
        body: data.body,
        facts: toJsonValue(data.facts),
        version: data.version,
        status: draftStatusToDb[data.status],
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
        sourceReferences: {
          createMany: {
            data: data.sourceRefs.map((sourceRef) => ({
              sourceId: sourceRef.sourceId,
              normalizedItemId: sourceRef.normalizedItemId,
              title: sourceRef.title,
              url: sourceRef.url,
              publishedAt: sourceRef.publishedAt ? new Date(sourceRef.publishedAt) : null,
            })),
          },
        },
      },
      include: { sourceReferences: true },
    });
    return this.mapDraft(draft);
  }

  async getDraft(draftId: string): Promise<DraftDto> {
    const draft = await this.prisma.draft.findUnique({
      where: { id: draftId },
      include: { sourceReferences: true },
    });
    if (!draft) {
      throw new NotFoundException(`Draft ${draftId} not found`);
    }
    return this.mapDraft(draft);
  }

  async updateDraft(draftId: string, body: UpdateDraftDto & Partial<Pick<DraftDto, 'status' | 'version'>>): Promise<DraftDto> {
    await this.ensureDraft(draftId);
    if (body.sourceRefs) {
      await this.prisma.$transaction([
        this.prisma.draftSourceReference.deleteMany({ where: { draftId } }),
        this.prisma.draft.update({
          where: { id: draftId },
          data: {
            title: body.title,
            outline: body.outline ? toJsonValue(body.outline) : undefined,
            body: body.body,
            facts: body.facts ? toJsonValue(body.facts) : undefined,
            tone: body.tone,
            status: body.status ? draftStatusToDb[body.status] : undefined,
            version: body.version,
          },
        }),
        this.prisma.draftSourceReference.createMany({
          data: body.sourceRefs.map((sourceRef) => ({
            draftId,
            sourceId: sourceRef.sourceId,
            normalizedItemId: sourceRef.normalizedItemId,
            title: sourceRef.title,
            url: sourceRef.url,
            publishedAt: sourceRef.publishedAt ? new Date(sourceRef.publishedAt) : null,
          })),
        }),
      ]);
    } else {
      await this.prisma.draft.update({
        where: { id: draftId },
        data: {
          title: body.title,
          outline: body.outline ? toJsonValue(body.outline) : undefined,
          body: body.body,
          facts: body.facts ? toJsonValue(body.facts) : undefined,
          tone: body.tone,
          status: body.status ? draftStatusToDb[body.status] : undefined,
          version: body.version,
        },
      });
    }

    return this.getDraft(draftId);
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
    const task = await this.prisma.reviewTask.create({
      data: {
        draftId: data.draftId,
        reviewerId: data.reviewerId,
        status: reviewStatusToDb[data.status],
        comments: data.comments,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        approvedAt: data.approvedAt ? new Date(data.approvedAt) : undefined,
        rejectedAt: data.rejectedAt ? new Date(data.rejectedAt) : undefined,
      },
    });
    return this.mapReviewTask(task);
  }

  async listReviewTasks(query: ListReviewTasksQueryDto): Promise<ReviewTaskDto[]> {
    const items = await this.prisma.reviewTask.findMany({
      where: {
        reviewerId: query.reviewerId,
        status: query.status ? reviewStatusToDb[query.status] : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((item) => this.mapReviewTask(item));
  }

  async getReviewTask(reviewTaskId: string): Promise<ReviewTaskDto> {
    const item = await this.prisma.reviewTask.findUnique({ where: { id: reviewTaskId } });
    if (!item) {
      throw new NotFoundException(`Review task ${reviewTaskId} not found`);
    }
    return this.mapReviewTask(item);
  }

  async findReviewTaskByDraft(draftId: string): Promise<ReviewTaskDto | null> {
    const item = await this.prisma.reviewTask.findUnique({ where: { draftId } });
    return item ? this.mapReviewTask(item) : null;
  }

  async updateReviewTask(reviewTaskId: string, data: Partial<ReviewTaskDto>): Promise<ReviewTaskDto> {
    await this.ensureReviewTask(reviewTaskId);
    const task = await this.prisma.reviewTask.update({
      where: { id: reviewTaskId },
      data: {
        reviewerId: data.reviewerId,
        status: data.status ? reviewStatusToDb[data.status] : undefined,
        comments: data.comments,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : data.scheduledAt === null ? null : undefined,
        approvedAt: data.approvedAt ? new Date(data.approvedAt) : data.approvedAt === null ? null : undefined,
        rejectedAt: data.rejectedAt ? new Date(data.rejectedAt) : data.rejectedAt === null ? null : undefined,
      },
    });
    return this.mapReviewTask(task);
  }

  async createAsset(data: Omit<AssetDto, 'createdAt'> & { createdAt?: string }): Promise<AssetDto> {
    const asset = await this.prisma.asset.create({
      data: {
        id: data.id,
        draftId: data.draftId,
        assetType: assetTypeToDb[data.assetType],
        pageNo: data.pageNo,
        storageUrl: data.storageUrl,
        width: data.width,
        height: data.height,
        mimeType: data.mimeType,
        templateName: data.templateName,
        metadata: toJsonValue(data.metadata ?? {}),
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      },
    });
    return this.mapAsset(asset);
  }

  async listAssetsByDraft(draftId: string): Promise<AssetDto[]> {
    const items = await this.prisma.asset.findMany({
      where: { draftId },
      orderBy: [{ pageNo: 'asc' }, { createdAt: 'asc' }],
    });
    return items.map((item) => this.mapAsset(item));
  }

  async getAsset(assetId: string): Promise<AssetDto> {
    const item = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!item) {
      throw new NotFoundException(`Asset ${assetId} not found`);
    }
    return this.mapAsset(item);
  }

  async updateAsset(assetId: string, body: UpdateAssetDto): Promise<AssetDto> {
    await this.ensureAsset(assetId);
    const item = await this.prisma.asset.update({
      where: { id: assetId },
      data: {
        templateName: body.templateName,
        metadata: body.metadata ? toJsonValue(body.metadata) : undefined,
      },
    });
    return this.mapAsset(item);
  }

  async listChannelVariants(query: ListChannelVariantsQueryDto): Promise<ChannelVariantDto[]> {
    const items = await this.prisma.channelVariant.findMany({
      where: {
        draftId: query.draftId,
        platform: query.platform ? platformTypeToDb[query.platform] : undefined,
      },
      include: { assetLinks: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((item) => this.mapChannelVariant(item));
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
    const variant = await this.prisma.channelVariant.create({
      data: {
        draftId: data.draftId,
        platform: platformTypeToDb[data.platform],
        title: data.title,
        caption: data.caption,
        hashtags: data.hashtags,
        coverAssetId: data.coverAssetId,
        publishMode: publishModeToDb[data.publishMode],
        status: data.status,
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
        assetLinks: {
          createMany: {
            data: data.assetBundle.map((assetId, index) => ({
              assetId,
              sortOrder: index,
            })),
          },
        },
      },
      include: { assetLinks: { orderBy: { sortOrder: 'asc' } } },
    });
    return this.mapChannelVariant(variant);
  }

  async findChannelVariantByDraftAndPlatform(draftId: string, platform: PlatformType): Promise<ChannelVariantDto | null> {
    const item = await this.prisma.channelVariant.findUnique({
      where: {
        draftId_platform: {
          draftId,
          platform: platformTypeToDb[platform] as never,
        },
      },
      include: { assetLinks: { orderBy: { sortOrder: 'asc' } } },
    });
    return item ? this.mapChannelVariant(item) : null;
  }

  async getChannelVariant(channelVariantId: string): Promise<ChannelVariantDto> {
    const item = await this.prisma.channelVariant.findUnique({
      where: { id: channelVariantId },
      include: { assetLinks: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!item) {
      throw new NotFoundException(`Channel variant ${channelVariantId} not found`);
    }
    return this.mapChannelVariant(item);
  }

  async updateChannelVariant(channelVariantId: string, body: UpdateChannelVariantDto): Promise<ChannelVariantDto> {
    await this.ensureChannelVariant(channelVariantId);
    const tasks: any[] = [];
    if (body.assetBundle) {
      tasks.push(this.prisma.channelVariantAsset.deleteMany({ where: { channelVariantId } }));
      tasks.push(
        this.prisma.channelVariantAsset.createMany({
          data: body.assetBundle.map((assetId, index) => ({
            channelVariantId,
            assetId,
            sortOrder: index,
          })),
        }),
      );
    }
    tasks.push(
      this.prisma.channelVariant.update({
        where: { id: channelVariantId },
        data: {
          title: body.title,
          caption: body.caption,
          hashtags: body.hashtags,
          coverAssetId: body.coverAssetId,
          status: body.status,
        },
      }),
    );
    await this.prisma.$transaction(tasks);
    return this.getChannelVariant(channelVariantId);
  }

  async listPublishTasks(query: ListPublishTasksQueryDto): Promise<PublishTaskDto[]> {
    const items = await this.prisma.publishTask.findMany({
      where: {
        status: query.status ? publishStatusToDb[query.status] : undefined,
        platform: query.platform ? platformTypeToDb[query.platform] : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((item) => this.mapPublishTask(item));
  }

  async createPublishTask(data: {
    channelVariantId: string;
    platform: PlatformType;
    status: PublishStatus;
    scheduledAt?: string;
    retryCount: number;
    responsePayload: Record<string, unknown>;
  }): Promise<PublishTaskDto> {
    const task = await this.prisma.publishTask.create({
      data: {
        channelVariantId: data.channelVariantId,
        platform: platformTypeToDb[data.platform],
        status: publishStatusToDb[data.status],
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        retryCount: data.retryCount,
        responsePayload: toJsonValue(data.responsePayload),
      },
    });
    return this.mapPublishTask(task);
  }

  async getPublishTask(publishTaskId: string): Promise<PublishTaskDto> {
    const item = await this.prisma.publishTask.findUnique({ where: { id: publishTaskId } });
    if (!item) {
      throw new NotFoundException(`Publish task ${publishTaskId} not found`);
    }
    return this.mapPublishTask(item);
  }

  async updatePublishTask(
    publishTaskId: string,
    data: Partial<PublishTaskDto>,
  ): Promise<PublishTaskDto> {
    await this.ensurePublishTask(publishTaskId);
    const item = await this.prisma.publishTask.update({
      where: { id: publishTaskId },
      data: {
        status: data.status ? publishStatusToDb[data.status] : undefined,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : data.scheduledAt === null ? null : undefined,
        startedAt: data.startedAt ? new Date(data.startedAt) : data.startedAt === null ? null : undefined,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : data.publishedAt === null ? null : undefined,
        remotePostId: data.remotePostId,
        retryCount: data.retryCount,
        responsePayload: data.responsePayload ? toJsonValue(data.responsePayload) : undefined,
        errorMessage: data.errorMessage,
      },
    });
    return this.mapPublishTask(item);
  }

  async listPublishedPublishTasks(): Promise<PublishTaskDto[]> {
    const items = await this.prisma.publishTask.findMany({
      where: { status: publishStatusToDb[PublishStatus.PUBLISHED] },
      orderBy: { publishedAt: 'desc' },
    });
    return items.map((item) => this.mapPublishTask(item));
  }

  async findPublishIdempotency(scope: 'create_task' | 'run_task', key: string): Promise<{ requestHash: string; publishTaskId: string | null } | null> {
    const item = await this.prisma.publishIdempotencyKey.findUnique({
      where: {
        scope_idempotencyKey: {
          scope: scope === 'create_task' ? PrismaPublishIdempotencyScope.CREATE_TASK : PrismaPublishIdempotencyScope.RUN_TASK,
          idempotencyKey: key,
        },
      },
    });

    if (!item) {
      return null;
    }

    return {
      requestHash: item.requestHash,
      publishTaskId: item.publishTaskId,
    };
  }

  async createPublishIdempotency(
    scope: 'create_task' | 'run_task',
    key: string,
    requestHash: string,
    publishTaskId: string,
  ): Promise<void> {
    await this.prisma.publishIdempotencyKey.create({
      data: {
        scope: scope === 'create_task' ? PrismaPublishIdempotencyScope.CREATE_TASK : PrismaPublishIdempotencyScope.RUN_TASK,
        idempotencyKey: key,
        requestHash,
        publishTaskId,
      },
    });
  }

  async createPerformanceMetric(data: Omit<PerformanceMetricDto, 'id'> & { id?: string }): Promise<PerformanceMetricDto> {
    const metric = await this.prisma.performanceMetric.create({
      data: {
        id: data.id,
        publishTaskId: data.publishTaskId,
        platform: platformTypeToDb[data.platform],
        views: data.views,
        likes: data.likes,
        comments: data.comments,
        shares: data.shares,
        saves: data.saves,
        clicks: data.clicks,
        capturedAt: new Date(data.capturedAt),
      },
    });
    return this.mapPerformanceMetric(metric);
  }

  async getLatestPerformanceMetric(publishTaskId: string): Promise<PerformanceMetricDto | null> {
    const metric = await this.prisma.performanceMetric.findFirst({
      where: { publishTaskId },
      orderBy: { capturedAt: 'desc' },
    });
    return metric ? this.mapPerformanceMetric(metric) : null;
  }

  async listMetrics(query: ListMetricsQueryDto): Promise<PerformanceMetricDto[]> {
    const items = await this.prisma.performanceMetric.findMany({
      where: {
        platform: query.platform ? platformTypeToDb[query.platform] : undefined,
        capturedAt: query.from || query.to
          ? {
              gte: query.from ? new Date(query.from) : undefined,
              lte: query.to ? new Date(query.to) : undefined,
            }
          : undefined,
      },
      orderBy: { capturedAt: 'desc' },
    });
    return items.map((item) => this.mapPerformanceMetric(item));
  }

  async listMetricsByPublishTask(publishTaskId: string): Promise<PerformanceMetricDto[]> {
    const items = await this.prisma.performanceMetric.findMany({
      where: { publishTaskId },
      orderBy: { capturedAt: 'desc' },
    });
    return items.map((item) => this.mapPerformanceMetric(item));
  }

  async countRawItems(): Promise<number> {
    return this.prisma.rawItem.count();
  }

  async countTopics(): Promise<number> {
    return this.prisma.topic.count();
  }

  async countDrafts(): Promise<number> {
    return this.prisma.draft.count();
  }

  async countPendingReviews(): Promise<number> {
    return this.prisma.reviewTask.count({
      where: { status: reviewStatusToDb[ReviewStatus.PENDING] },
    });
  }

  async countScheduledPublishes(): Promise<number> {
    return this.prisma.publishTask.count({
      where: { scheduledAt: { not: null } },
    });
  }

  async countPublishedToday(date?: string): Promise<number> {
    if (!date) {
      return this.prisma.publishTask.count({
        where: { status: publishStatusToDb[PublishStatus.PUBLISHED] },
      });
    }

    const from = new Date(`${date}T00:00:00.000Z`);
    const to = new Date(`${date}T23:59:59.999Z`);
    return this.prisma.publishTask.count({
      where: {
        status: publishStatusToDb[PublishStatus.PUBLISHED],
        publishedAt: { gte: from, lte: to },
      },
    });
  }

  private async ensureSource(sourceId: string): Promise<void> {
    await this.getSource(sourceId);
  }

  private async ensureTopic(topicId: string): Promise<void> {
    await this.getTopic(topicId);
  }

  private async ensureDraft(draftId: string): Promise<void> {
    await this.getDraft(draftId);
  }

  private async ensureReviewTask(reviewTaskId: string): Promise<void> {
    await this.getReviewTask(reviewTaskId);
  }

  private async ensureAsset(assetId: string): Promise<void> {
    await this.getAsset(assetId);
  }

  private async ensureChannelVariant(channelVariantId: string): Promise<void> {
    await this.getChannelVariant(channelVariantId);
  }

  private async ensurePublishTask(publishTaskId: string): Promise<void> {
    await this.getPublishTask(publishTaskId);
  }

  private mapSource(item: any): SourceDto {
    return {
      id: item.id,
      name: item.name,
      type: dbToSourceType[item.type],
      platform: item.platform,
      config: item.config as Record<string, unknown>,
      status: dbToSourceStatus[item.status],
      lastSyncedAt: this.toIso(item.lastSyncedAt),
      createdAt: this.toIso(item.createdAt)!,
      updatedAt: this.toIso(item.updatedAt)!,
    };
  }

  private mapRawItem(item: any): RawItemDto {
    return {
      id: item.id,
      sourceId: item.sourceId,
      externalId: item.externalId ?? undefined,
      url: item.url,
      title: item.title ?? undefined,
      rawText: item.rawText ?? undefined,
      rawMedia: (item.rawMedia as Record<string, unknown>[]) ?? [],
      author: item.author ?? undefined,
      publishedAt: this.toIso(item.publishedAt),
      fetchedAt: this.toIso(item.fetchedAt)!,
      languageCode: item.languageCode ?? undefined,
      contentHash: item.contentHash,
      createdAt: this.toIso(item.createdAt)!,
    };
  }

  private mapNormalizedItem(item: any): NormalizedItemDto {
    return {
      id: item.id,
      rawItemId: item.rawItemId,
      cleanTitle: item.cleanTitle ?? undefined,
      cleanText: item.cleanText ?? undefined,
      summary: item.summary ?? undefined,
      entities: (item.entities as Record<string, unknown>[]) ?? [],
      keywords: item.keywords ?? [],
      dedupeKey: item.dedupeKey,
      qualityScore: item.qualityScore ?? undefined,
      topicClusterKey: item.topicClusterKey ?? undefined,
      createdAt: this.toIso(item.createdAt)!,
    };
  }

  private mapTopic(item: any): TopicDto {
    return {
      id: item.id,
      topicDate: this.toDateOnly(item.topicDate)!,
      title: item.title,
      angle: item.angle ?? undefined,
      summary: item.summary ?? undefined,
      score: item.score,
      status: dbToTopicStatus[item.status],
      clusterPayload: (item.clusterPayload as Record<string, unknown>) ?? {},
      selectedBy: item.selectedById ?? undefined,
      selectedAt: this.toIso(item.selectedAt),
      createdAt: this.toIso(item.createdAt)!,
      updatedAt: this.toIso(item.updatedAt)!,
    };
  }

  private mapSourceReference(item: any): SourceReferenceDto {
    return {
      sourceId: item.sourceId,
      normalizedItemId: item.normalizedItemId,
      title: item.title,
      url: item.url,
      publishedAt: this.toIso(item.publishedAt),
    };
  }

  private mapDraft(item: any): DraftDto {
    return {
      id: item.id,
      topicId: item.topicId,
      draftType: dbToDraftType[item.draftType],
      languageCode: item.languageCode,
      tone: item.tone,
      title: item.title ?? undefined,
      outline: (item.outline as Record<string, unknown>[]) ?? [],
      body: item.body ?? undefined,
      facts: (item.facts as Record<string, unknown>[]) ?? [],
      sourceRefs: (item.sourceReferences ?? []).map((sourceRef: any) => this.mapSourceReference(sourceRef)),
      version: item.version,
      status: dbToDraftStatus[item.status],
      createdAt: this.toIso(item.createdAt)!,
      updatedAt: this.toIso(item.updatedAt)!,
    };
  }

  private mapAsset(item: any): AssetDto {
    return {
      id: item.id,
      draftId: item.draftId,
      assetType: dbToAssetType[item.assetType],
      pageNo: item.pageNo ?? undefined,
      storageUrl: item.storageUrl,
      width: item.width ?? undefined,
      height: item.height ?? undefined,
      mimeType: item.mimeType ?? undefined,
      templateName: item.templateName ?? undefined,
      metadata: (item.metadata as Record<string, unknown>) ?? {},
      createdAt: this.toIso(item.createdAt)!,
    };
  }

  private mapChannelVariant(item: any): ChannelVariantDto {
    return {
      id: item.id,
      draftId: item.draftId,
      platform: dbToPlatformType[item.platform],
      title: item.title ?? undefined,
      caption: item.caption ?? undefined,
      hashtags: item.hashtags ?? [],
      coverAssetId: item.coverAssetId ?? undefined,
      assetBundle: (item.assetLinks ?? []).map((assetLink: any) => assetLink.assetId),
      publishMode: dbToPublishMode[item.publishMode],
      status: item.status,
      createdAt: this.toIso(item.createdAt)!,
      updatedAt: this.toIso(item.updatedAt)!,
    };
  }

  private mapReviewTask(item: any): ReviewTaskDto {
    return {
      id: item.id,
      draftId: item.draftId,
      reviewerId: item.reviewerId ?? undefined,
      status: dbToReviewStatus[item.status],
      comments: item.comments ?? undefined,
      scheduledAt: this.toIso(item.scheduledAt),
      approvedAt: this.toIso(item.approvedAt),
      rejectedAt: this.toIso(item.rejectedAt),
      createdAt: this.toIso(item.createdAt)!,
      updatedAt: this.toIso(item.updatedAt)!,
    };
  }

  private mapPublishTask(item: any): PublishTaskDto {
    return {
      id: item.id,
      channelVariantId: item.channelVariantId,
      platform: dbToPlatformType[item.platform],
      status: dbToPublishStatus[item.status],
      scheduledAt: this.toIso(item.scheduledAt),
      startedAt: this.toIso(item.startedAt),
      publishedAt: this.toIso(item.publishedAt),
      remotePostId: item.remotePostId ?? undefined,
      retryCount: item.retryCount,
      responsePayload: (item.responsePayload as Record<string, unknown>) ?? {},
      errorMessage: item.errorMessage ?? undefined,
      createdAt: this.toIso(item.createdAt)!,
      updatedAt: this.toIso(item.updatedAt)!,
    };
  }

  private mapPerformanceMetric(item: any): PerformanceMetricDto {
    return {
      id: item.id,
      publishTaskId: item.publishTaskId,
      platform: dbToPlatformType[item.platform],
      views: item.views,
      likes: item.likes,
      comments: item.comments,
      shares: item.shares,
      saves: item.saves,
      clicks: item.clicks,
      capturedAt: this.toIso(item.capturedAt)!,
    };
  }

  private toIso(value: Date | string | null | undefined): string | undefined {
    if (!value) {
      return undefined;
    }
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  }

  private toDateOnly(value: Date | string | null | undefined): string | undefined {
    return this.toIso(value)?.slice(0, 10);
  }
}
