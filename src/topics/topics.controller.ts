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
import { GenerateTopicsDto, ListTopicsQueryDto, TopicDto, TopicListResponseDto, UpdateTopicDto } from './dto/topic.dto';
import { TopicsService } from './topics.service';

@ApiTags('Topics')
@ApiBearerAuth()
@Controller()
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get('topics')
  @ApiOperation({ summary: 'List topics' })
  listTopics(@Query() query: ListTopicsQueryDto): Promise<TopicListResponseDto> {
    return this.topicsService.listTopics(query);
  }

  @Post('topics/generate')
  @ApiOperation({ summary: 'Generate daily topic candidates' })
  generateTopics(@Body() body: GenerateTopicsDto): Promise<TopicListResponseDto> {
    return this.topicsService.generateTopics(body);
  }

  @Get('topics/:topicId')
  @ApiOperation({ summary: 'Get a topic' })
  getTopic(@Param('topicId') topicId: string): Promise<TopicDto> {
    return this.topicsService.getTopic(topicId);
  }

  @Patch('topics/:topicId')
  @ApiOperation({ summary: 'Update a topic' })
  updateTopic(@Param('topicId') topicId: string, @Body() body: UpdateTopicDto): Promise<TopicDto> {
    return this.topicsService.updateTopic(topicId, body);
  }

  @Post('topics/:topicId/select')
  @ApiOperation({ summary: 'Mark a topic as selected' })
  selectTopic(@Param('topicId') topicId: string): Promise<TopicDto> {
    return this.topicsService.selectTopic(topicId);
  }

  @Post('topics/:topicId/reject')
  @ApiOperation({ summary: 'Reject a topic' })
  rejectTopic(@Param('topicId') topicId: string): Promise<TopicDto> {
    return this.topicsService.rejectTopic(topicId);
  }
}
