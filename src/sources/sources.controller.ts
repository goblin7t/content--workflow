import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JobAcceptedResponseDto } from '../common/dto/common.dto';
import {
  CreateSourceDto,
  ListSourcesQueryDto,
  SourceDto,
  SourceListResponseDto,
  UpdateSourceDto,
} from './dto/source.dto';
import { SourcesService } from './sources.service';

@ApiTags('Sources')
@ApiBearerAuth()
@Controller('sources')
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Get()
  @ApiOperation({ summary: 'List content sources' })
  listSources(@Query() query: ListSourcesQueryDto): Promise<SourceListResponseDto> {
    return this.sourcesService.listSources(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a content source' })
  createSource(@Body() body: CreateSourceDto): Promise<SourceDto> {
    return this.sourcesService.createSource(body);
  }

  @Get(':sourceId')
  @ApiOperation({ summary: 'Get a single source' })
  getSource(@Param('sourceId') sourceId: string): Promise<SourceDto> {
    return this.sourcesService.getSource(sourceId);
  }

  @Patch(':sourceId')
  @ApiOperation({ summary: 'Update a source' })
  updateSource(
    @Param('sourceId') sourceId: string,
    @Body() body: UpdateSourceDto,
  ): Promise<SourceDto> {
    return this.sourcesService.updateSource(sourceId, body);
  }

  @Post(':sourceId/sync')
  @ApiOperation({ summary: 'Trigger source sync' })
  syncSource(@Param('sourceId') sourceId: string): Promise<JobAcceptedResponseDto> {
    return this.sourcesService.syncSource(sourceId);
  }
}
