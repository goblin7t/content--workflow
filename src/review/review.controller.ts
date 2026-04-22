import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApproveReviewTaskDto,
  CreateReviewTaskDto,
  ListReviewTasksQueryDto,
  RejectReviewTaskDto,
  ReviewTaskDto,
  ReviewTaskListResponseDto,
} from './dto/review.dto';
import { ReviewService } from './review.service';

@ApiTags('Review')
@ApiBearerAuth()
@Controller()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('review-tasks')
  @ApiOperation({ summary: 'List review tasks' })
  listReviewTasks(@Query() query: ListReviewTasksQueryDto): Promise<ReviewTaskListResponseDto> {
    return this.reviewService.listReviewTasks(query);
  }

  @Post('review-tasks')
  @ApiOperation({ summary: 'Create a review task' })
  createReviewTask(@Body() body: CreateReviewTaskDto): Promise<ReviewTaskDto> {
    return this.reviewService.createReviewTask(body);
  }

  @Get('review-tasks/:reviewTaskId')
  @ApiOperation({ summary: 'Get a review task' })
  getReviewTask(@Param('reviewTaskId') reviewTaskId: string): Promise<ReviewTaskDto> {
    return this.reviewService.getReviewTask(reviewTaskId);
  }

  @Post('review-tasks/:reviewTaskId/approve')
  @ApiOperation({ summary: 'Approve a review task' })
  approveReviewTask(
    @Param('reviewTaskId') reviewTaskId: string,
    @Body() body: ApproveReviewTaskDto,
  ): Promise<ReviewTaskDto> {
    return this.reviewService.approveReviewTask(reviewTaskId, body);
  }

  @Post('review-tasks/:reviewTaskId/reject')
  @ApiOperation({ summary: 'Reject a review task' })
  rejectReviewTask(
    @Param('reviewTaskId') reviewTaskId: string,
    @Body() body: RejectReviewTaskDto,
  ): Promise<ReviewTaskDto> {
    return this.reviewService.rejectReviewTask(reviewTaskId, body);
  }

  @Post('review-tasks/:reviewTaskId/request-regenerate')
  @ApiOperation({ summary: 'Request regeneration from review' })
  requestRegeneration(
    @Param('reviewTaskId') reviewTaskId: string,
    @Body() body: RejectReviewTaskDto,
  ): Promise<ReviewTaskDto> {
    return this.reviewService.requestRegeneration(reviewTaskId, body);
  }
}
