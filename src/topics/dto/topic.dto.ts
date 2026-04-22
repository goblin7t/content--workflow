import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { ListResponseDto, StatusQueryDto } from '../../common/dto/common.dto';
import { TopicStatus } from '../../common/enums/workflow.enums';

export class ListTopicsQueryDto extends StatusQueryDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsEnum(TopicStatus)
  declare status?: TopicStatus;
}

export class GenerateTopicsDto {
  @IsDateString()
  date!: string;

  @IsInt()
  @Min(1)
  targetSummaryCount!: number;

  @IsInt()
  @Min(1)
  targetDeepCount!: number;
}

export class UpdateTopicDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  angle?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsEnum(TopicStatus)
  status?: TopicStatus;
}

export class TopicDto {
  @IsUUID()
  id!: string;

  @IsDateString()
  topicDate!: string;

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

  @IsEnum(TopicStatus)
  status!: TopicStatus;

  @IsObject()
  clusterPayload!: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  selectedBy?: string;

  @IsOptional()
  @IsDateString()
  selectedAt?: string;

  @IsDateString()
  createdAt!: string;

  @IsDateString()
  updatedAt!: string;
}

export class TopicListResponseDto extends ListResponseDto<TopicDto> {
  @ValidateNested({ each: true })
  @Type(() => TopicDto)
  items!: TopicDto[];
}
