import { Controller, Get, Header, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { DashboardOverviewDto, DashboardOverviewQueryDto, DashboardVisualizationDto } from './dto/dashboard.dto';
import { DashboardService } from './dashboard.service';
import { renderDashboardPage } from './dashboard.page';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('dashboard')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @ApiProduces('text/html')
  @ApiOperation({ summary: 'Open the local workflow dashboard page' })
  getDashboardPage(): string {
    return renderDashboardPage();
  }

  @Get('dashboard/overview')
  @ApiOperation({ summary: 'Get dashboard overview metrics' })
  getOverview(@Query() query: DashboardOverviewQueryDto): Promise<DashboardOverviewDto> {
    return this.dashboardService.getOverview(query);
  }

  @Get('dashboard/visualization')
  @ApiOperation({ summary: 'Get dashboard visualization data' })
  getVisualization(@Query() query: DashboardOverviewQueryDto): Promise<DashboardVisualizationDto> {
    return this.dashboardService.getVisualization(query);
  }
}
