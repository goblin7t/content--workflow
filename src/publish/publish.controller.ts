import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListPublishTasksQueryDto, CreatePublishTaskDto, PublishTaskDto, PublishTaskListResponseDto } from './dto/publish.dto';
import { PublishService } from './publish.service';

@ApiTags('Publish')
@ApiBearerAuth()
@Controller()
export class PublishController {
  constructor(private readonly publishService: PublishService) {}

  @Get('publish-tasks')
  @ApiOperation({ summary: 'List publish tasks' })
  listPublishTasks(@Query() query: ListPublishTasksQueryDto): Promise<PublishTaskListResponseDto> {
    return this.publishService.listPublishTasks(query);
  }

  @Post('publish-tasks')
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  @ApiOperation({ summary: 'Create a publish task' })
  createPublishTask(
    @Headers('idempotency-key') idempotencyKey: string,
    @Body() body: CreatePublishTaskDto,
  ): Promise<PublishTaskDto> {
    return this.publishService.createPublishTask(idempotencyKey, body);
  }

  @Get('publish-tasks/:publishTaskId')
  @ApiOperation({ summary: 'Get a publish task' })
  getPublishTask(@Param('publishTaskId') publishTaskId: string): Promise<PublishTaskDto> {
    return this.publishService.getPublishTask(publishTaskId);
  }

  @Post('publish-tasks/:publishTaskId/run')
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  @ApiOperation({ summary: 'Run a publish task immediately' })
  runPublishTask(
    @Param('publishTaskId') publishTaskId: string,
    @Headers('idempotency-key') idempotencyKey: string,
  ): Promise<PublishTaskDto> {
    return this.publishService.runPublishTask(publishTaskId, idempotencyKey);
  }

  @Post('publish-tasks/:publishTaskId/retry')
  @ApiOperation({ summary: 'Retry a failed publish task' })
  retryPublishTask(@Param('publishTaskId') publishTaskId: string): Promise<PublishTaskDto> {
    return this.publishService.retryPublishTask(publishTaskId);
  }

  @Post('publish-tasks/:publishTaskId/cancel')
  @ApiOperation({ summary: 'Cancel a queued publish task' })
  cancelPublishTask(@Param('publishTaskId') publishTaskId: string): Promise<PublishTaskDto> {
    return this.publishService.cancelPublishTask(publishTaskId);
  }
}
