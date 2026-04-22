import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JobAcceptedResponseDto } from '../common/dto/common.dto';
import { ListRawItemsQueryDto, RawItemDto, RawItemListResponseDto } from './dto/ingestion.dto';
import { IngestionService } from './ingestion.service';

@ApiTags('Ingestion')
@ApiBearerAuth()
@Controller()
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('ingestion/run')
  @ApiOperation({ summary: 'Trigger ingestion for all active sources' })
  runIngestion(): Promise<JobAcceptedResponseDto> {
    return this.ingestionService.runIngestion();
  }

  @Get('raw-items')
  @ApiOperation({ summary: 'List raw ingested items' })
  listRawItems(@Query() query: ListRawItemsQueryDto): Promise<RawItemListResponseDto> {
    return this.ingestionService.listRawItems(query);
  }

  @Get('raw-items/:rawItemId')
  @ApiOperation({ summary: 'Get a raw item' })
  getRawItem(@Param('rawItemId') rawItemId: string): Promise<RawItemDto> {
    return this.ingestionService.getRawItem(rawItemId);
  }
}
