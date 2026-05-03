import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PublishStatus, SourceType } from '../src/common/enums/workflow.enums';
import { DashboardService } from '../src/dashboard/dashboard.service';
import { DemoService } from '../src/demo/demo.service';
import { IngestionService } from '../src/ingestion/ingestion.service';
import { JOB_STATUS, JOB_TYPE } from '../src/jobs/jobs.constants';
import { JobsRunnerService } from '../src/jobs/jobs.runner';
import { JobsService } from '../src/jobs/jobs.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { SourcesService } from '../src/sources/sources.service';
import { WorkflowStoreService } from '../src/common/services/workflow-store.service';
import { WorkflowStoreFake } from './fakes/workflow-store.fake';

describe('Workflow services (integration)', () => {
  let moduleRef: TestingModule;
  let demoService: DemoService;
  let dashboardService: DashboardService;
  let jobsService: JobsService;
  let jobsRunner: JobsRunnerService;
  let sourcesService: SourcesService;
  let ingestionService: IngestionService;
  let store: WorkflowStoreService;

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

    demoService = moduleRef.get(DemoService);
    dashboardService = moduleRef.get(DashboardService);
    jobsService = moduleRef.get(JobsService);
    jobsRunner = moduleRef.get(JobsRunnerService);
    sourcesService = moduleRef.get(SourcesService);
    ingestionService = moduleRef.get(IngestionService);
    store = moduleRef.get(WorkflowStoreService);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('runs the demo workflow end-to-end through services', async () => {
    const result = await demoService.runDemo({
      resetStore: true,
      topicDate: '2025-02-14',
    });

    expect(result.sourceIds).toHaveLength(4);
    expect(result.rawItemsCount).toBe(4);
    expect(result.normalizedItemsCount).toBe(4);
    expect(result.drafts).toHaveLength(4);
    expect(result.publishTasks).toHaveLength(16);
    expect(result.metrics).toHaveLength(16);

    for (const draft of result.drafts) {
      expect(draft.sourceRefCount).toBeGreaterThan(0);
      expect(draft.assetCount).toBeGreaterThanOrEqual(7);
    }

    for (const publishTask of result.publishTasks) {
      expect(publishTask.status).toBe('published');
      expect(publishTask.remotePostId).toContain(publishTask.platform);
    }

    for (const metric of result.metrics) {
      expect(metric.views).toBe(100);
    }
  });

  it('builds dashboard visualization from the generated workflow state', async () => {
    await demoService.runDemo({
      resetStore: true,
      topicDate: '2025-02-14',
    });

    const visualization = await dashboardService.getVisualization({
      date: '2025-02-14',
    });

    expect(visualization.overview.rawItemsCount).toBe(4);
    expect(visualization.overview.topicsCount).toBe(4);
    expect(visualization.overview.draftsGenerated).toBe(4);
    expect(visualization.overview.pendingReviews).toBe(0);
    expect(visualization.totals.normalizedItemsCount).toBe(4);
    expect(visualization.totals.reviewsCount).toBe(4);
    expect(visualization.totals.publishTasksCount).toBe(16);
    expect(visualization.totals.totalViews).toBe(1600);
    expect(visualization.sources).toHaveLength(4);
    expect(visualization.sources.every((item) => item.rawItemsCount === 1)).toBe(true);
    expect(visualization.sources.every((item) => item.config && typeof item.config === 'object')).toBe(true);
    expect(visualization.sources.every((item) => item.createdAt && item.updatedAt)).toBe(true);
    expect(visualization.topics).toHaveLength(4);
    expect(visualization.topics[0].normalizedItemCount).toBeGreaterThan(0);
    expect(visualization.drafts).toHaveLength(4);
    expect(visualization.reviews).toHaveLength(4);
    expect(visualization.publishes).toHaveLength(16);
    expect(visualization.publishes[0].channelVariantId).toBeTruthy();
    expect(visualization.publishes[0].draftType).toBeTruthy();
    expect(visualization.publishCandidates).toHaveLength(0);
    expect(visualization.platformBreakdown).toHaveLength(4);
    expect(visualization.jobs).toHaveLength(0);
    expect(visualization.platformBreakdown.every((item) => item.published === 4)).toBe(true);
  });

  it('applies dashboard filters across the workflow lineage', async () => {
    await demoService.runDemo({
      resetStore: true,
      topicDate: '2025-02-14',
    });

    const visualization = await dashboardService.getVisualization({
      date: '2025-02-14',
      platform: 'tiktok',
      publishStatus: PublishStatus.PUBLISHED,
    });

    expect(visualization.overview.rawItemsCount).toBe(1);
    expect(visualization.overview.topicsCount).toBe(1);
    expect(visualization.overview.draftsGenerated).toBe(1);
    expect(visualization.totals.normalizedItemsCount).toBe(1);
    expect(visualization.totals.reviewsCount).toBe(1);
    expect(visualization.totals.publishTasksCount).toBe(1);
    expect(visualization.totals.totalViews).toBe(100);
    expect(visualization.sources).toHaveLength(1);
    expect(visualization.sources[0].platform).toBe('tiktok');
    expect(visualization.sources[0].rawItemsCount).toBe(1);
    expect(visualization.topics).toHaveLength(1);
    expect(visualization.drafts).toHaveLength(1);
    expect(visualization.reviews).toHaveLength(1);
    expect(visualization.publishes).toHaveLength(1);
    expect(visualization.publishes[0].platform).toBe('tiktok');
    expect(visualization.publishCandidates).toHaveLength(0);
    expect(visualization.platformBreakdown).toHaveLength(1);
    expect(visualization.platformBreakdown[0].platform).toBe('tiktok');
    expect(visualization.platformBreakdown[0].published).toBe(1);
    expect(visualization.jobs).toHaveLength(0);
  });

  it('enqueues ingestion as a content job and executes it through the job runner', async () => {
    await sourcesService.createSource({
      name: 'Queue Source',
      type: SourceType.SOCIAL_API,
      platform: 'tiktok',
      config: { account: 'queue-demo' },
    });

    const accepted = await ingestionService.runIngestion();
    expect(accepted.status).toBe('queued');

    const queuedJob = await jobsService.getJob(accepted.jobId);
    expect(queuedJob.jobType).toBe(JOB_TYPE.INGESTION_RUN_ALL_SOURCES);
    expect(queuedJob.status).toBe(JOB_STATUS.QUEUED);
    expect(await store.countRawItems()).toBe(0);

    const completedJob = await jobsRunner.runJob(queuedJob.id);
    expect(completedJob.status).toBe(JOB_STATUS.SUCCEEDED);
    expect(completedJob.startedAt).toBeTruthy();
    expect(completedJob.finishedAt).toBeTruthy();
    expect(await store.countRawItems()).toBe(1);

    const visualization = await dashboardService.getVisualization({});
    expect(visualization.jobs).toHaveLength(1);
    expect(visualization.jobs[0].jobType).toBe(JOB_TYPE.INGESTION_RUN_ALL_SOURCES);
    expect(visualization.jobs[0].status).toBe(JOB_STATUS.SUCCEEDED);
  });
});
