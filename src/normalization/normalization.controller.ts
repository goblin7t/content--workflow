import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JobAcceptedResponseDto } from '../common/dto/common.dto';
import {
  ListNormalizedItemsQueryDto,
  NormalizedItemDto,
  NormalizedItemListResponseDto,
} from './dto/normalization.dto';
import { NormalizationService } from './normalization.service';

@ApiTags('Normalization')
@ApiBearerAuth()
@Controller()
export class NormalizationController {
  constructor(private readonly normalizationService: NormalizationService) {}

  @Post('normalization/run')
  @ApiOperation({ summary: 'Trigger normalization and semantic deduplication' })
  runNormalization(): Promise<JobAcceptedResponseDto> {
    return this.normalizationService.runNormalization();
  }

  @Get('normalized-items')
  @ApiOperation({ summary: 'List normalized items' })
  listNormalizedItems(
    @Query() query: ListNormalizedItemsQueryDto,
  ): Promise<NormalizedItemListResponseDto> {
    return this.normalizationService.listNormalizedItems(query);
  }

  @Get('normalized-items/:normalizedItemId')
  @ApiOperation({ summary: 'Get a normalized item' })
  getNormalizedItem(@Param('normalizedItemId') normalizedItemId: string): Promise<NormalizedItemDto> {
    return this.normalizationService.getNormalizedItem(normalizedItemId);
  }
}
