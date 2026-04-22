import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class PageQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
}

export class StatusQueryDto {
  @IsOptional()
  @IsString()
  status?: string;
}

export class UuidParamDto {
  @IsUUID()
  id!: string;
}

export class JobAcceptedResponseDto {
  @IsUUID()
  jobId!: string;

  @IsString()
  status!: 'queued';
}

export class ErrorResponseDto {
  @IsString()
  code!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsObject()
  details?: Record<string, unknown>;
}

export class SourceReferenceDto {
  @IsUUID()
  sourceId!: string;

  @IsUUID()
  normalizedItemId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}

export class UuidListDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  items!: string[];
}

export class MetricWindowQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

export class RenderSizeDto {
  @IsInt()
  @Min(300)
  @Max(9999)
  width!: number;

  @IsInt()
  @Min(300)
  @Max(9999)
  height!: number;
}

export class ListResponseDto<T> {
  @IsArray()
  items!: T[];
}

export class NestedSourceReferencesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SourceReferenceDto)
  items!: SourceReferenceDto[];
}
