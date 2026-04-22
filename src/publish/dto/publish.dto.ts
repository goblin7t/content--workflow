import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { ListResponseDto, StatusQueryDto } from '../../common/dto/common.dto';
import { PlatformType, PublishStatus } from '../../common/enums/workflow.enums';

export class ListPublishTasksQueryDto extends StatusQueryDto {
  @IsOptional()
  @IsEnum(PublishStatus)
  declare status?: PublishStatus;

  @IsOptional()
  @IsEnum(PlatformType)
  platform?: PlatformType;
}

export class CreatePublishTaskDto {
  @IsUUID()
  channelVariantId!: string;

  @IsEnum(PlatformType)
  platform!: PlatformType;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}

export class PublishTaskDto {
  @IsUUID()
  id!: string;

  @IsUUID()
  channelVariantId!: string;

  @IsEnum(PlatformType)
  platform!: PlatformType;

  @IsEnum(PublishStatus)
  status!: PublishStatus;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsString()
  remotePostId?: string;

  @IsInt()
  @Min(0)
  retryCount!: number;

  @IsObject()
  responsePayload!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsDateString()
  createdAt!: string;

  @IsDateString()
  updatedAt!: string;
}

export class PublishTaskListResponseDto extends ListResponseDto<PublishTaskDto> {
  @ValidateNested({ each: true })
  @Type(() => PublishTaskDto)
  items!: PublishTaskDto[];
}
