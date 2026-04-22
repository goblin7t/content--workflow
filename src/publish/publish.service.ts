import { ConflictException, Injectable } from '@nestjs/common';
import { PublishStatus } from '../common/enums/workflow.enums';
import { WorkflowStoreService } from '../common/services/workflow-store.service';
import { hashPayload, nowIso } from '../common/utils/workflow.helpers';
import {
  CreatePublishTaskDto,
  ListPublishTasksQueryDto,
  PublishTaskDto,
  PublishTaskListResponseDto,
} from './dto/publish.dto';

@Injectable()
export class PublishService {
  constructor(private readonly store: WorkflowStoreService) {}

  async listPublishTasks(query: ListPublishTasksQueryDto): Promise<PublishTaskListResponseDto> {
    return { items: await this.store.listPublishTasks(query) };
  }

  async createPublishTask(idempotencyHeader: string, body: CreatePublishTaskDto): Promise<PublishTaskDto> {
    if (!idempotencyHeader) {
      throw new ConflictException('Idempotency-Key is required');
    }

    const variant = await this.getVariant(body.channelVariantId);
    if (variant.platform !== body.platform) {
      throw new ConflictException('Publish task platform must match channel variant platform');
    }

    const requestHash = hashPayload(body);
    const existingRecord = await this.store.findPublishIdempotency('create_task', idempotencyHeader);
    if (existingRecord) {
      if (existingRecord.requestHash !== requestHash) {
        throw new ConflictException('Idempotency key reuse with a different payload is not allowed');
      }

      return this.getPublishTask(existingRecord.publishTaskId!);
    }

    const task = await this.store.createPublishTask({
      channelVariantId: variant.id,
      platform: body.platform,
      status: PublishStatus.QUEUED,
      scheduledAt: body.scheduledAt,
      retryCount: 0,
      responsePayload: {},
    });
    await this.store.createPublishIdempotency('create_task', idempotencyHeader, requestHash, task.id);
    return task;
  }

  async getPublishTask(publishTaskId: string): Promise<PublishTaskDto> {
    return this.store.getPublishTask(publishTaskId);
  }

  async runPublishTask(publishTaskId: string, idempotencyHeader: string): Promise<PublishTaskDto> {
    if (!idempotencyHeader) {
      throw new ConflictException('Idempotency-Key is required');
    }

    const task = await this.getPublishTask(publishTaskId);
    const requestHash = hashPayload({ publishTaskId });
    const existingRecord = await this.store.findPublishIdempotency('run_task', idempotencyHeader);

    if (existingRecord) {
      if (existingRecord.requestHash !== requestHash) {
        throw new ConflictException('Idempotency key reuse with a different run payload is not allowed');
      }

      return this.getPublishTask(existingRecord.publishTaskId!);
    }

    if (task.status === PublishStatus.CANCELLED) {
      throw new ConflictException('Cancelled publish tasks cannot be run');
    }

    const now = nowIso();
    await this.store.updatePublishTask(task.id, {
      status: PublishStatus.RUNNING,
      startedAt: now,
    });
    const publishedAt = nowIso();
    const updatedTask = await this.store.updatePublishTask(task.id, {
      status: PublishStatus.PUBLISHED,
      publishedAt,
      remotePostId: `${task.platform}-${task.id}`,
      responsePayload: {
        message: 'Published by service skeleton',
      },
    });

    await this.store.createPublishIdempotency('run_task', idempotencyHeader, requestHash, task.id);
    return updatedTask;
  }

  async retryPublishTask(publishTaskId: string): Promise<PublishTaskDto> {
    const task = await this.getPublishTask(publishTaskId);
    if (task.status !== PublishStatus.FAILED) {
      throw new ConflictException('Only failed publish tasks can be retried');
    }

    return this.store.updatePublishTask(task.id, {
      status: PublishStatus.QUEUED,
      retryCount: task.retryCount + 1,
      errorMessage: undefined,
    });
  }

  async cancelPublishTask(publishTaskId: string): Promise<PublishTaskDto> {
    const task = await this.getPublishTask(publishTaskId);
    if (task.status !== PublishStatus.QUEUED) {
      throw new ConflictException('Only queued publish tasks can be cancelled');
    }

    return this.store.updatePublishTask(task.id, {
      status: PublishStatus.CANCELLED,
    });
  }

  private async getVariant(channelVariantId: string) {
    return this.store.getChannelVariant(channelVariantId);
  }
}
