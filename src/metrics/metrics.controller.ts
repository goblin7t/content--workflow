import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JobAcceptedResponseDto } from '../common/dto/common.dto';
import { ListMetricsQueryDto, PerformanceMetricListResponseDto } from './dto/metric.dto';
import { MetricsService } from './metrics.service';

@ApiTags('Metrics')
@ApiBearerAuth()
@Controller()
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Post('metrics/sync')
  @ApiOperation({ summary: 'Pull fresh metrics snapshots from platforms' })
  syncMetrics(): Promise<JobAcceptedResponseDto> {
    return this.metricsService.syncMetrics();
  }

  @Get('metrics')
  @ApiOperation({ summary: 'List performance metric snapshots' })
  listMetrics(@Query() query: ListMetricsQueryDto): Promise<PerformanceMetricListResponseDto> {
    return this.metricsService.listMetrics(query);
  }

  @Get('posts/:publishTaskId/performance')
  @ApiOperation({ summary: 'Get metrics snapshots for a published post' })
  getPostPerformance(
    @Param('publishTaskId') publishTaskId: string,
  ): Promise<PerformanceMetricListResponseDto> {
    return this.metricsService.getPostPerformance(publishTaskId);
  }
}
