import { createHash, randomUUID } from 'crypto';
import { JobAcceptedResponseDto } from '../dto/common.dto';

export function nowIso(): string {
  return new Date().toISOString();
}

export function newId(): string {
  return randomUUID();
}

export function queueJob(): JobAcceptedResponseDto {
  return {
    jobId: newId(),
    status: 'queued',
  };
}

export function hashPayload(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

export function idempotencyKey(scope: string, key: string): string {
  return `${scope}:${key}`;
}

export function syntheticTitle(sourceName: string, sequence: number): string {
  return `${sourceName} signal ${sequence}`;
}

export function syntheticText(sourceName: string, sequence: number): string {
  return `Synthetic ingestion payload ${sequence} collected from ${sourceName}.`;
}

export function sortByCreatedAtDesc<T extends { createdAt?: string }>(items: T[]): T[] {
  return [...items].sort((left, right) => {
    const leftTime = left.createdAt ? Date.parse(left.createdAt) : 0;
    const rightTime = right.createdAt ? Date.parse(right.createdAt) : 0;
    return rightTime - leftTime;
  });
}
