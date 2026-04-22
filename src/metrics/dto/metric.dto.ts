import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { ListResponseDto, MetricWindowQueryDto } from '../../common/dto/common.dto';
import { PlatformType } from '../../common/enums/workflow.enums';

export class ListMetricsQueryDto extends MetricWindowQueryDto {
  @IsOptional()
  @IsEnum(PlatformType)
  platform?: PlatformType;
}

export class PerformanceMetricDto {
  @IsUUID()
  id!: string;

  @IsUUID()
  publishTaskId!: string;

  @IsEnum(PlatformType)
  platform!: PlatformType;

  @IsInt()
  @Min(0)
  views!: number;

  @IsInt()
  @Min(0)
  likes!: number;

  @IsInt()
  @Min(0)
  comments!: number;

  @IsInt()
  @Min(0)
  shares!: number;

  @IsInt()
  @Min(0)
  saves!: number;

  @IsInt()
  @Min(0)
  clicks!: number;

  @IsDateString()
  capturedAt!: string;
}

export class PerformanceMetricListResponseDto extends ListResponseDto<PerformanceMetricDto> {
  @ValidateNested({ each: true })
  @Type(() => PerformanceMetricDto)
  items!: PerformanceMetricDto[];
}
