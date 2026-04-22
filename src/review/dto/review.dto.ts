import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ListResponseDto, StatusQueryDto } from '../../common/dto/common.dto';
import { PlatformType, ReviewStatus } from '../../common/enums/workflow.enums';

export class ListReviewTasksQueryDto extends StatusQueryDto {
  @IsOptional()
  @IsUUID()
  reviewerId?: string;

  @IsOptional()
  @IsEnum(ReviewStatus)
  declare status?: ReviewStatus;
}

export class CreateReviewTaskDto {
  @IsUUID()
  draftId!: string;

  @IsOptional()
  @IsUUID()
  reviewerId?: string;
}

export class ApproveReviewTaskDto {
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(PlatformType, { each: true })
  selectedPlatforms!: PlatformType[];
}

export class RejectReviewTaskDto {
  @IsString()
  comments!: string;
}

export class ReviewTaskDto {
  @IsUUID()
  id!: string;

  @IsUUID()
  draftId!: string;

  @IsOptional()
  @IsUUID()
  reviewerId?: string;

  @IsEnum(ReviewStatus)
  status!: ReviewStatus;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsDateString()
  approvedAt?: string;

  @IsOptional()
  @IsDateString()
  rejectedAt?: string;

  @IsDateString()
  createdAt!: string;

  @IsDateString()
  updatedAt!: string;
}

export class ReviewTaskListResponseDto extends ListResponseDto<ReviewTaskDto> {
  @ValidateNested({ each: true })
  @Type(() => ReviewTaskDto)
  items!: ReviewTaskDto[];
}
