import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { PlatformType } from '../../common/enums/workflow.enums';

export class RunDemoRequestDto {
  @IsOptional()
  @IsBoolean()
  resetStore?: boolean = true;

  @IsOptional()
  @IsDateString()
  topicDate?: string;
}

export class DemoDraftSummaryDto {
  @IsUUID()
  draftId!: string;

  @IsString()
  title!: string;

  @IsString()
  draftType!: string;

  @IsInt()
  @Min(1)
  sourceRefCount!: number;

  @IsInt()
  @Min(0)
  assetCount!: number;
}

export class DemoPublishSummaryDto {
  @IsUUID()
  publishTaskId!: string;

  @IsString()
  platform!: PlatformType;

  @IsString()
  status!: string;

  @IsOptional()
  @IsString()
  remotePostId?: string;
}

export class DemoMetricSummaryDto {
  @IsUUID()
  publishTaskId!: string;

  @IsString()
  platform!: PlatformType;

  @IsInt()
  @Min(0)
  views!: number;
}

export class DemoRunResultDto {
  @IsArray()
  @IsString({ each: true })
  sourceIds!: string[];

  @IsInt()
  @Min(0)
  rawItemsCount!: number;

  @IsInt()
  @Min(0)
  normalizedItemsCount!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DemoDraftSummaryDto)
  drafts!: DemoDraftSummaryDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DemoPublishSummaryDto)
  publishTasks!: DemoPublishSummaryDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DemoMetricSummaryDto)
  metrics!: DemoMetricSummaryDto[];
}
