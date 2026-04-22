import { ConflictException, Injectable } from '@nestjs/common';
import { DraftStatus, ReviewStatus } from '../common/enums/workflow.enums';
import { WorkflowStoreService } from '../common/services/workflow-store.service';
import { nowIso } from '../common/utils/workflow.helpers';
import {
  ApproveReviewTaskDto,
  CreateReviewTaskDto,
  ListReviewTasksQueryDto,
  RejectReviewTaskDto,
  ReviewTaskDto,
  ReviewTaskListResponseDto,
} from './dto/review.dto';

@Injectable()
export class ReviewService {
  constructor(private readonly store: WorkflowStoreService) {}

  async listReviewTasks(query: ListReviewTasksQueryDto): Promise<ReviewTaskListResponseDto> {
    return { items: await this.store.listReviewTasks(query) };
  }

  async createReviewTask(body: CreateReviewTaskDto): Promise<ReviewTaskDto> {
    const draft = await this.store.getDraft(body.draftId);

    if (draft.sourceRefs.length === 0) {
      throw new ConflictException('Review task requires at least one source reference');
    }

    const existing = await this.store.findReviewTaskByDraft(body.draftId);
    if (existing) {
      return existing;
    }

    const task = await this.store.createReviewTask({
      draftId: draft.id,
      reviewerId: body.reviewerId,
      status: ReviewStatus.PENDING,
    });
    await this.store.updateDraft(draft.id, { status: DraftStatus.IN_REVIEW });
    return task;
  }

  async getReviewTask(reviewTaskId: string): Promise<ReviewTaskDto> {
    return this.store.getReviewTask(reviewTaskId);
  }

  async approveReviewTask(reviewTaskId: string, body: ApproveReviewTaskDto): Promise<ReviewTaskDto> {
    const task = await this.store.getReviewTask(reviewTaskId);
    const draft = await this.store.getDraft(task.draftId);
    const variants = await this.store.listChannelVariants({ draftId: draft.id });

    const missingPlatforms = body.selectedPlatforms.filter(
      (platform) => !variants.some((variant) => variant.platform === platform),
    );
    if (missingPlatforms.length > 0) {
      throw new ConflictException(`Missing channel variants for platforms: ${missingPlatforms.join(', ')}`);
    }

    const now = nowIso();
    await this.store.updateDraft(draft.id, {
      status: body.scheduledAt ? DraftStatus.SCHEDULED : DraftStatus.APPROVED,
    });
    return this.store.updateReviewTask(reviewTaskId, {
      status: ReviewStatus.APPROVED,
      scheduledAt: body.scheduledAt,
      approvedAt: now,
    });
  }

  async rejectReviewTask(reviewTaskId: string, body: RejectReviewTaskDto): Promise<ReviewTaskDto> {
    const task = await this.store.getReviewTask(reviewTaskId);
    const now = nowIso();
    await this.store.updateDraft(task.draftId, { status: DraftStatus.REJECTED });
    return this.store.updateReviewTask(reviewTaskId, {
      status: ReviewStatus.REJECTED,
      comments: body.comments,
      rejectedAt: now,
    });
  }

  async requestRegeneration(reviewTaskId: string, body: RejectReviewTaskDto): Promise<ReviewTaskDto> {
    const task = await this.store.getReviewTask(reviewTaskId);
    const draft = await this.store.getDraft(task.draftId);
    await this.store.updateDraft(task.draftId, {
      status: DraftStatus.DRAFT,
      version: draft.version + 1,
    });
    return this.store.updateReviewTask(reviewTaskId, {
      status: ReviewStatus.REGENERATE_REQUESTED,
      comments: body.comments,
    });
  }
}
