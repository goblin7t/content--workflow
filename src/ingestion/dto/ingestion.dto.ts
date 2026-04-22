import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ListResponseDto, PageQueryDto } from '../../common/dto/common.dto';

export class ListRawItemsQueryDto extends PageQueryDto {
  @IsOptional()
  @IsUUID()
  sourceId?: string;
}

export class RawItemDto {
  @IsUUID()
  id!: string;

  @IsUUID()
  sourceId!: string;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  rawText?: string;

  @IsArray()
  rawMedia!: Record<string, unknown>[];

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsDateString()
  fetchedAt!: string;

  @IsOptional()
  @IsString()
  languageCode?: string;

  @IsString()
  @MinLength(16)
  contentHash!: string;

  @IsDateString()
  createdAt!: string;
}

export class RawItemListResponseDto extends ListResponseDto<RawItemDto> {
  @ValidateNested({ each: true })
  @Type(() => RawItemDto)
  items!: RawItemDto[];
}
