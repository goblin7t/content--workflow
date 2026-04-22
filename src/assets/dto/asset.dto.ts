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
import { ListResponseDto } from '../../common/dto/common.dto';
import { AssetType } from '../../common/enums/workflow.enums';

export class AssetDto {
  @IsUUID()
  id!: string;

  @IsUUID()
  draftId!: string;

  @IsEnum(AssetType)
  assetType!: AssetType;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageNo?: number;

  @IsString()
  storageUrl!: string;

  @IsOptional()
  @IsInt()
  width?: number;

  @IsOptional()
  @IsInt()
  height?: number;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsString()
  templateName?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsDateString()
  createdAt!: string;
}

export class UpdateAssetDto {
  @IsOptional()
  @IsString()
  templateName?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class AssetListResponseDto extends ListResponseDto<AssetDto> {
  @ValidateNested({ each: true })
  @Type(() => AssetDto)
  items!: AssetDto[];
}
