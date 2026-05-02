import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { DashboardService } from '../src/dashboard/dashboard.service';
import { DemoService } from '../src/demo/demo.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { WorkflowStoreService } from '../src/common/services/workflow-store.service';
import { WorkflowStoreFake } from './fakes/workflow-store.fake';

describe('Workflow services (integration)', () => {
  let moduleRef: TestingModule;
  let demoService: DemoService;
  let dashboardService: DashboardService;

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
    expect(visualization.topics).toHaveLength(4);
    expect(visualization.drafts).toHaveLength(4);
    expect(visualization.publishes).toHaveLength(16);
    expect(visualization.platformBreakdown).toHaveLength(4);
    expect(visualization.platformBreakdown.every((item) => item.published === 4)).toBe(true);
  });
});
