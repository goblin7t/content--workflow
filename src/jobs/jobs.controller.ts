import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContentJobDto, ContentJobListResponseDto, ListJobsQueryDto } from './dto/job.dto';
import { JobsRunnerService } from './jobs.runner';
import { JobsService } from './jobs.service';

@ApiTags('Jobs')
@ApiBearerAuth()
@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly jobsRunner: JobsRunnerService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List workflow jobs' })
  listJobs(@Query() query: ListJobsQueryDto): Promise<ContentJobListResponseDto> {
    return this.jobsService.listJobs(query);
  }

  @Get(':jobId')
  @ApiOperation({ summary: 'Get a workflow job' })
  getJob(@Param('jobId') jobId: string): Promise<ContentJobDto> {
    return this.jobsService.getJob(jobId);
  }

  @Post(':jobId/run')
  @ApiOperation({ summary: 'Execute a queued workflow job immediately' })
  runJob(@Param('jobId') jobId: string): Promise<ContentJobDto> {
    return this.jobsRunner.runJob(jobId);
  }
}
