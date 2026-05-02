import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { AppModule } from '../src/app.module';
import { PlatformType, PublishMode, PublishStatus, ReviewStatus, DraftStatus, DraftType } from '../src/common/enums/workflow.enums';
import { WorkflowStoreService } from '../src/common/services/workflow-store.service';
import { PublishService } from '../src/publish/publish.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { ReviewService } from '../src/review/review.service';
import { WorkflowStoreFake } from './fakes/workflow-store.fake';

describe('Publish and review services (integration)', () => {
  let moduleRef: TestingModule;
  let store: WorkflowStoreService;
  let publishService: PublishService;
  let reviewService: ReviewService;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
        enableShutdownHooks: jest.fn(),
      })
      .overrideProvider(WorkflowStoreService)
      .useClass(WorkflowStoreFake)
      .compile();

    store = moduleRef.get(WorkflowStoreService);
    publishService = moduleRef.get(PublishService);
    reviewService = moduleRef.get(ReviewService);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('reuses a publish task for the same idempotency key and payload', async () => {
    const variant = await createVariantFixture(store, PlatformType.TIKTOK);

    const first = await publishService.createPublishTask('same-key', {
      channelVariantId: variant.id,
      platform: PlatformType.TIKTOK,
    });
    const second = await publishService.createPublishTask('same-key', {
      channelVariantId: variant.id,
      platform: PlatformType.TIKTOK,
    });

    expect(second.id).toBe(first.id);
  });

  it('rejects publish task creation when an idempotency key is reused with a different payload', async () => {
    const tiktokVariant = await createVariantFixture(store, PlatformType.TIKTOK);
    const facebookVariant = await createVariantFixture(store, PlatformType.FACEBOOK);

    await publishService.createPublishTask('same-key', {
      channelVariantId: tiktokVariant.id,
      platform: PlatformType.TIKTOK,
    });

    await expect(
      publishService.createPublishTask('same-key', {
        channelVariantId: facebookVariant.id,
        platform: PlatformType.FACEBOOK,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects publish task creation when the requested platform does not match the variant', async () => {
    const variant = await createVariantFixture(store, PlatformType.TIKTOK);

    await expect(
      publishService.createPublishTask('mismatch-key', {
        channelVariantId: variant.id,
        platform: PlatformType.FACEBOOK,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects running a cancelled publish task', async () => {
    const variant = await createVariantFixture(store, PlatformType.XIAOHONGSHU);
    const task = await store.createPublishTask({
      channelVariantId: variant.id,
      platform: PlatformType.XIAOHONGSHU,
      status: PublishStatus.CANCELLED,
      retryCount: 0,
      responsePayload: {},
    });

    await expect(publishService.runPublishTask(task.id, 'run-cancelled')).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects reusing a run idempotency key for a different publish task', async () => {
    const firstVariant = await createVariantFixture(store, PlatformType.XIAOHONGSHU);
    const secondVariant = await createVariantFixture(store, PlatformType.DOUYIN);
    const firstTask = await store.createPublishTask({
      channelVariantId: firstVariant.id,
      platform: PlatformType.XIAOHONGSHU,
      status: PublishStatus.QUEUED,
      retryCount: 0,
      responsePayload: {},
    });
    const secondTask = await store.createPublishTask({
      channelVariantId: secondVariant.id,
      platform: PlatformType.DOUYIN,
      status: PublishStatus.QUEUED,
      retryCount: 0,
      responsePayload: {},
    });

    await publishService.runPublishTask(firstTask.id, 'run-key');

    await expect(publishService.runPublishTask(secondTask.id, 'run-key')).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects creating a review task for a draft without source references', async () => {
    const draft = await createDraftFixture(store, []);

    await expect(reviewService.createReviewTask({ draftId: draft.id })).rejects.toBeInstanceOf(ConflictException);
  });

  it('reuses an existing review task for the same draft', async () => {
    const draft = await createDraftFixture(store, [createSourceRef()]);

    const first = await reviewService.createReviewTask({ draftId: draft.id });
    const second = await reviewService.createReviewTask({ draftId: draft.id });

    expect(second.id).toBe(first.id);
  });

  it('rejects review approval when a selected platform has no channel variant', async () => {
    const draft = await createDraftFixture(store, [createSourceRef()]);
    const task = await reviewService.createReviewTask({ draftId: draft.id });
    await store.createChannelVariant({
      draftId: draft.id,
      platform: PlatformType.TIKTOK,
      title: 'TikTok variant',
      caption: 'caption',
      hashtags: ['#tiktok'],
      assetBundle: [],
      publishMode: PublishMode.DIRECT_API,
      status: 'draft',
    });

    await expect(
      reviewService.approveReviewTask(task.id, {
        selectedPlatforms: [PlatformType.TIKTOK, PlatformType.FACEBOOK],
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('marks the draft as scheduled when review approval includes a schedule', async () => {
    const draft = await createDraftFixture(store, [createSourceRef()]);
    const task = await reviewService.createReviewTask({ draftId: draft.id });
    await store.createChannelVariant({
      draftId: draft.id,
      platform: PlatformType.TIKTOK,
      title: 'TikTok variant',
      caption: 'caption',
      hashtags: ['#tiktok'],
      assetBundle: [],
      publishMode: PublishMode.DIRECT_API,
      status: 'draft',
    });

    const scheduledAt = '2025-02-15T10:30:00.000Z';
    const approved = await reviewService.approveReviewTask(task.id, {
      scheduledAt,
      selectedPlatforms: [PlatformType.TIKTOK],
    });
    const updatedDraft = await store.getDraft(draft.id);

    expect(approved.status).toBe(ReviewStatus.APPROVED);
    expect(approved.scheduledAt).toBe(scheduledAt);
    expect(approved.approvedAt).toBeDefined();
    expect(updatedDraft.status).toBe(DraftStatus.SCHEDULED);
  });

  it('requests regeneration by resetting draft status and incrementing the version', async () => {
    const draft = await createDraftFixture(store, [createSourceRef()], {
      status: DraftStatus.IN_REVIEW,
      version: 2,
    });
    const task = await store.createReviewTask({
      draftId: draft.id,
      status: ReviewStatus.PENDING,
    });

    const updatedTask = await reviewService.requestRegeneration(task.id, {
      comments: 'Need a sharper angle and cleaner evidence chain.',
    });
    const updatedDraft = await store.getDraft(draft.id);

    expect(updatedTask.status).toBe(ReviewStatus.REGENERATE_REQUESTED);
    expect(updatedTask.comments).toContain('sharper angle');
    expect(updatedDraft.status).toBe(DraftStatus.DRAFT);
    expect(updatedDraft.version).toBe(3);
  });
});

function createSourceRef() {
  return {
    sourceId: randomUUID(),
    normalizedItemId: randomUUID(),
    title: 'Signal item',
    url: 'https://example.com/story',
    publishedAt: '2025-02-14T08:00:00.000Z',
  };
}

async function createDraftFixture(
  store: WorkflowStoreService,
  sourceRefs: Array<ReturnType<typeof createSourceRef>>,
  overrides: Partial<{ status: DraftStatus; version: number }> = {},
) {
  return store.createDraft({
    id: randomUUID(),
    topicId: randomUUID(),
    draftType: DraftType.SUMMARY,
    languageCode: 'zh-CN',
    tone: 'professional',
    title: 'Fixture draft',
    outline: [{ heading: 'What happened' }],
    body: 'Draft body',
    facts: [{ label: 'topic_score', value: 88 }],
    sourceRefs,
    version: overrides.version ?? 1,
    status: overrides.status ?? DraftStatus.DRAFT,
  });
}

async function createVariantFixture(store: WorkflowStoreService, platform: PlatformType) {
  const draft = await createDraftFixture(store, [createSourceRef()]);

  return store.createChannelVariant({
    draftId: draft.id,
    platform,
    title: `${platform} variant`,
    caption: 'caption',
    hashtags: [`#${platform}`],
    assetBundle: [],
    publishMode:
      platform === PlatformType.TIKTOK || platform === PlatformType.FACEBOOK
        ? PublishMode.DIRECT_API
        : PublishMode.SEMI_AUTO,
    status: 'draft',
  });
}
