import { Type } from 'class-transformer';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ListResponseDto, PageQueryDto } from '../../common/dto/common.dto';
import { SourceStatus, SourceType } from '../../common/enums/workflow.enums';

export class ListSourcesQueryDto extends PageQueryDto {
  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsEnum(SourceStatus)
  status?: SourceStatus;
}

export class CreateSourceDto {
  @IsString()
  name!: string;

  @IsEnum(SourceType)
  type!: SourceType;

  @IsString()
  platform!: string;

  @IsObject()
  config!: Record<string, unknown>;

  @IsOptional()
  @IsEnum(SourceStatus)
  status?: SourceStatus;
}

export class UpdateSourceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(SourceType)
  type?: SourceType;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(SourceStatus)
  status?: SourceStatus;
}

export class SourceDto {
  @IsUUID()
  id!: string;

  @IsString()
  name!: string;

  @IsEnum(SourceType)
  type!: SourceType;

  @IsString()
  platform!: string;

  @IsObject()
  config!: Record<string, unknown>;

  @IsEnum(SourceStatus)
  status!: SourceStatus;

  @IsOptional()
  @IsString()
  lastSyncedAt?: string;

  @IsString()
  createdAt!: string;

  @IsString()
  updatedAt!: string;
}

export class SourceListResponseDto extends ListResponseDto<SourceDto> {
  @ValidateNested({ each: true })
  @Type(() => SourceDto)
  items!: SourceDto[];
}
