import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ListResponseDto, PageQueryDto } from '../../common/dto/common.dto';

export class ListNormalizedItemsQueryDto extends PageQueryDto {
  @IsOptional()
  @IsUUID()
  topicId?: string;
}

export class NormalizedItemDto {
  @IsUUID()
  id!: string;

  @IsUUID()
  rawItemId!: string;

  @IsOptional()
  @IsString()
  cleanTitle?: string;

  @IsOptional()
  @IsString()
  cleanText?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsArray()
  entities!: Record<string, unknown>[];

  @IsArray()
  keywords!: string[];

  @IsString()
  @MinLength(16)
  dedupeKey!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  qualityScore?: number;

  @IsOptional()
  @IsString()
  topicClusterKey?: string;

  @IsString()
  createdAt!: string;
}

export class NormalizedItemListResponseDto extends ListResponseDto<NormalizedItemDto> {
  @ValidateNested({ each: true })
  @Type(() => NormalizedItemDto)
  items!: NormalizedItemDto[];
}
