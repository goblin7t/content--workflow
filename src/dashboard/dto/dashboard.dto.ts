import { IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { DraftStatus, DraftType, PlatformType, PublishStatus, ReviewStatus, SourceStatus, SourceType, TopicStatus } from '../../common/enums/workflow.enums';

export class DashboardOverviewQueryDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsEnum(SourceStatus)
  sourceStatus?: SourceStatus;

  @IsOptional()
  @IsEnum(TopicStatus)
  topicStatus?: TopicStatus;

  @IsOptional()
  @IsEnum(DraftStatus)
  draftStatus?: DraftStatus;

  @IsOptional()
  @IsEnum(ReviewStatus)
  reviewStatus?: ReviewStatus;

  @IsOptional()
  @IsEnum(PublishStatus)
  publishStatus?: PublishStatus;
}

export class DashboardOverviewDto {
  @IsInt()
  @Min(0)
  rawItemsCount!: number;

  @IsInt()
  @Min(0)
  topicsCount!: number;

  @IsInt()
  @Min(0)
  draftsGenerated!: number;

  @IsInt()
  @Min(0)
  pendingReviews!: number;

  @IsInt()
  @Min(0)
  scheduledPublishes!: number;

  @IsInt()
  @Min(0)
  publishedToday!: number;
}

export class DashboardPlatformBreakdownDto {
  @IsString()
  platform!: PlatformType;

  @IsInt()
  @Min(0)
  publishTasks!: number;

  @IsInt()
  @Min(0)
  published!: number;

  @IsInt()
  @Min(0)
  failed!: number;

  @IsInt()
  @Min(0)
  queued!: number;

  @IsInt()
  @Min(0)
  views!: number;

  @IsInt()
  @Min(0)
  likes!: number;

  @IsInt()
  @Min(0)
  comments!: number;
}

export class DashboardSourceSummaryDto {
  @IsString()
  id!: string;

  @IsString()
  name!: string;

  @IsString()
  type!: SourceType;

  @IsString()
  platform!: string;

  @IsString()
  status!: SourceStatus;

  @IsObject()
  config!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  lastSyncedAt?: string;

  @IsString()
  createdAt!: string;

  @IsString()
  updatedAt!: string;

  @IsInt()
  @Min(0)
  rawItemsCount!: number;
}

export class DashboardTopicSummaryDto {
  @IsString()
  id!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  angle?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsNumber()
  score!: number;

  @IsString()
  status!: TopicStatus;

  @IsInt()
  @Min(0)
  normalizedItemCount!: number;

  @IsString()
  createdAt!: string;

  @IsInt()
  @Min(0)
  sourceCount!: number;

  @IsArray()
  platforms!: string[];

  @IsArray()
  sourceNames!: string[];

  @IsArray()
  hotKeywords!: string[];

  @IsArray()
  candidateItems!: DashboardTopicCandidateDto[];

  @IsString()
  recommendation!: string;
}

export class DashboardTopicCandidateDto {
  @IsString()
  id!: string;

  @IsBoolean()
  isPrimary!: boolean;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  fullText?: string;

  @IsString()
  sourceName!: string;

  @IsString()
  platform!: string;

  @IsArray()
  keywords!: string[];
}

export class DashboardDraftSummaryDto {
  @IsString()
  id!: string;

  @IsString()
  title!: string;

  @IsString()
  draftType!: DraftType;

  @IsString()
  status!: DraftStatus;

  @IsInt()
  @Min(0)
  sourceRefCount!: number;

  @IsInt()
  @Min(0)
  assetCount!: number;

  @IsInt()
  @Min(0)
  variantCount!: number;

  @IsOptional()
  @IsString()
  reviewStatus?: ReviewStatus;
}

export class DashboardReviewSummaryDto {
  @IsString()
  id!: string;

  @IsString()
  draftId!: string;

  @IsString()
  draftTitle!: string;

  @IsString()
  draftType!: DraftType;

  @IsString()
  status!: ReviewStatus;

  @IsArray()
  availablePlatforms!: PlatformType[];

  @IsOptional()
  @IsString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  approvedAt?: string;

  @IsOptional()
  @IsString()
  rejectedAt?: string;

  @IsArray()
  variants!: DashboardReviewVariantSummaryDto[];
}

export class DashboardReviewVariantSummaryDto {
  @IsString()
  id!: string;

  @IsString()
  platform!: PlatformType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsArray()
  hashtags!: string[];

  @IsString()
  status!: string;
}

export class DashboardPublishSummaryDto {
  @IsString()
  id!: string;

  @IsString()
  channelVariantId!: string;

  @IsString()
  draftId!: string;

  @IsString()
  draftType!: DraftType;

  @IsString()
  platform!: PlatformType;

  @IsString()
  status!: PublishStatus;

  @IsOptional()
  @IsString()
  draftTitle?: string;

  @IsOptional()
  @IsString()
  scheduledAt?: string;

  @IsInt()
  @Min(0)
  retryCount!: number;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsOptional()
  @IsString()
  remotePostId?: string;

  @IsOptional()
  @IsString()
  publishedAt?: string;
}

export class DashboardPublishCandidateDto {
  @IsString()
  channelVariantId!: string;

  @IsString()
  draftId!: string;

  @IsString()
  draftTitle!: string;

  @IsString()
  draftType!: DraftType;

  @IsString()
  platform!: PlatformType;

  @IsString()
  variantStatus!: string;
}

export class DashboardJobSummaryDto {
  @IsString()
  id!: string;

  @IsString()
  jobType!: string;

  @IsString()
  status!: string;

  @IsObject()
  payload!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  topicId?: string;

  @IsOptional()
  @IsString()
  draftId?: string;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsOptional()
  @IsString()
  startedAt?: string;

  @IsOptional()
  @IsString()
  finishedAt?: string;

  @IsString()
  createdAt!: string;
}

export class DashboardTotalsDto {
  @IsInt()
  @Min(0)
  normalizedItemsCount!: number;

  @IsInt()
  @Min(0)
  reviewsCount!: number;

  @IsInt()
  @Min(0)
  publishTasksCount!: number;

  @IsInt()
  @Min(0)
  totalViews!: number;
}

export class DashboardVisualizationDto {
  overview!: DashboardOverviewDto;

  totals!: DashboardTotalsDto;

  @IsArray()
  sources!: DashboardSourceSummaryDto[];

  @IsArray()
  topics!: DashboardTopicSummaryDto[];

  @IsArray()
  drafts!: DashboardDraftSummaryDto[];

  @IsArray()
  reviews!: DashboardReviewSummaryDto[];

  @IsArray()
  publishes!: DashboardPublishSummaryDto[];

  @IsArray()
  publishCandidates!: DashboardPublishCandidateDto[];

  @IsArray()
  platformBreakdown!: DashboardPlatformBreakdownDto[];

  @IsArray()
  jobs!: DashboardJobSummaryDto[];
}
