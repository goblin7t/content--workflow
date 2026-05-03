import { Type } from 'class-transformer';
import { IsObject, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ListResponseDto, StatusQueryDto } from '../../common/dto/common.dto';

export class ListJobsQueryDto extends StatusQueryDto {
  @IsOptional()
  @IsString()
  jobType?: string;
}

export class CreateJobDto {
  @IsString()
  jobType!: string;

  @IsOptional()
  @IsUUID()
  topicId?: string;

  @IsOptional()
  @IsUUID()
  draftId?: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}

export class ContentJobDto {
  @IsUUID()
  id!: string;

  @IsOptional()
  @IsUUID()
  topicId?: string;

  @IsOptional()
  @IsUUID()
  draftId?: string;

  @IsString()
  jobType!: string;

  @IsString()
  status!: string;

  @IsObject()
  payload!: Record<string, unknown>;

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

export class ContentJobListResponseDto extends ListResponseDto<ContentJobDto> {
  @ValidateNested({ each: true })
  @Type(() => ContentJobDto)
  items!: ContentJobDto[];
}
