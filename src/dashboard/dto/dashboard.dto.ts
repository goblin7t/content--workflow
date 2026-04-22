import { IsArray, IsDateString, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { DraftStatus, DraftType, PlatformType, PublishStatus, ReviewStatus, SourceStatus, SourceType, TopicStatus } from '../../common/enums/workflow.enums';

export class DashboardOverviewQueryDto {
  @IsOptional()
  @IsDateString()
  date?: string;
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

  @IsOptional()
  @IsString()
  lastSyncedAt?: string;
}

export class DashboardTopicSummaryDto {
  @IsString()
  id!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  angle?: string;

  @IsNumber()
  score!: number;

  @IsString()
  status!: TopicStatus;
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

export class DashboardPublishSummaryDto {
  @IsString()
  id!: string;

  @IsString()
  platform!: PlatformType;

  @IsString()
  status!: PublishStatus;

  @IsOptional()
  @IsString()
  draftTitle?: string;

  @IsOptional()
  @IsString()
  remotePostId?: string;

  @IsOptional()
  @IsString()
  publishedAt?: string;
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
  publishes!: DashboardPublishSummaryDto[];

  @IsArray()
  platformBreakdown!: DashboardPlatformBreakdownDto[];
}
