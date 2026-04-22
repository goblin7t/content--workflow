import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ListResponseDto } from '../../common/dto/common.dto';
import { PlatformType, PublishMode } from '../../common/enums/workflow.enums';

export class ListChannelVariantsQueryDto {
  @IsOptional()
  @IsUUID()
  draftId?: string;

  @IsOptional()
  @IsEnum(PlatformType)
  platform?: PlatformType;
}

export class UpdateChannelVariantDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsArray()
  hashtags?: string[];

  @IsOptional()
  @IsUUID()
  coverAssetId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  assetBundle?: string[];

  @IsOptional()
  @IsString()
  status?: string;
}

export class ChannelVariantDto {
  @IsUUID()
  id!: string;

  @IsUUID()
  draftId!: string;

  @IsEnum(PlatformType)
  platform!: PlatformType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsArray()
  hashtags!: string[];

  @IsOptional()
  @IsUUID()
  coverAssetId?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  assetBundle!: string[];

  @IsEnum(PublishMode)
  publishMode!: PublishMode;

  @IsString()
  status!: string;

  @IsString()
  createdAt!: string;

  @IsString()
  updatedAt!: string;
}

export class ChannelVariantListResponseDto extends ListResponseDto<ChannelVariantDto> {
  @ValidateNested({ each: true })
  @Type(() => ChannelVariantDto)
  items!: ChannelVariantDto[];
}
