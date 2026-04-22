import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ListResponseDto, SourceReferenceDto, StatusQueryDto } from '../../common/dto/common.dto';
import { DraftStatus, DraftType, PlatformType } from '../../common/enums/workflow.enums';

export class ListDraftsQueryDto extends StatusQueryDto {
  @IsOptional()
  @IsUUID()
  topicId?: string;

  @IsOptional()
  @IsEnum(DraftStatus)
  declare status?: DraftStatus;
}

export class GenerateDraftDto {
  @IsUUID()
  topicId!: string;

  @IsEnum(DraftType)
  draftType!: DraftType;

  @IsString()
  tone!: string;

  @IsString()
  languageCode!: string;
}

export class UpdateDraftDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  outline?: Record<string, unknown>[];

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsArray()
  facts?: Record<string, unknown>[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SourceReferenceDto)
  sourceRefs?: SourceReferenceDto[];

  @IsOptional()
  @IsString()
  tone?: string;
}

export class RenderDraftDto {
  @IsString()
  template!: string;

  @IsInt()
  @Min(1)
  @Max(20)
  pageCount!: number;

  @Matches(/^[0-9]{3,5}x[0-9]{3,5}$/)
  size!: string;
}

export class CreateChannelVariantsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(PlatformType, { each: true })
  platforms!: PlatformType[];
}

export class DraftDto {
  @IsUUID()
  id!: string;

  @IsUUID()
  topicId!: string;

  @IsEnum(DraftType)
  draftType!: DraftType;

  @IsString()
  languageCode!: string;

  @IsString()
  tone!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsArray()
  outline!: Record<string, unknown>[];

  @IsOptional()
  @IsString()
  body?: string;

  @IsArray()
  facts!: Record<string, unknown>[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SourceReferenceDto)
  sourceRefs!: SourceReferenceDto[];

  @IsInt()
  @Min(1)
  version!: number;

  @IsEnum(DraftStatus)
  status!: DraftStatus;

  @IsDateString()
  createdAt!: string;

  @IsDateString()
  updatedAt!: string;
}

export class DraftListResponseDto extends ListResponseDto<DraftDto> {
  @ValidateNested({ each: true })
  @Type(() => DraftDto)
  items!: DraftDto[];
}
