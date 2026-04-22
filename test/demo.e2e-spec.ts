import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { WorkflowStoreService } from '../src/common/services/workflow-store.service';
import { WorkflowStoreFake } from './fakes/workflow-store.fake';

describe('DemoController (e2e)', () => {
  let app: any;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
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

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('runs the demo workflow end-to-end', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/demo/run')
      .send({
        resetStore: true,
        topicDate: '2025-02-14',
      })
      .expect(201);

    expect(response.body.sourceIds).toHaveLength(4);
    expect(response.body.rawItemsCount).toBe(4);
    expect(response.body.normalizedItemsCount).toBe(4);
    expect(response.body.drafts).toHaveLength(4);
    expect(response.body.publishTasks).toHaveLength(16);
    expect(response.body.metrics).toHaveLength(16);

    for (const draft of response.body.drafts) {
      expect(draft.sourceRefCount).toBeGreaterThan(0);
      expect(draft.assetCount).toBeGreaterThanOrEqual(7);
    }

    for (const publishTask of response.body.publishTasks) {
      expect(publishTask.status).toBe('published');
      expect(publishTask.remotePostId).toContain(publishTask.platform);
    }

    for (const metric of response.body.metrics) {
      expect(metric.views).toBe(100);
    }
  });

  it('rejects unknown request fields via validation pipe', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/demo/run')
      .send({
        resetStore: true,
        unexpectedField: 'x',
      })
      .expect(400);
  });

  it('serves dashboard visualization data and page', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/demo/run')
      .send({ resetStore: true })
      .expect(201);

    const visualization = await request(app.getHttpServer())
      .get('/api/v1/dashboard/visualization')
      .expect(200);

    expect(visualization.body.overview.rawItemsCount).toBe(4);
    expect(visualization.body.totals.normalizedItemsCount).toBe(4);
    expect(visualization.body.sources).toHaveLength(4);
    expect(visualization.body.drafts).toHaveLength(4);
    expect(visualization.body.publishes).toHaveLength(16);
    expect(visualization.body.platformBreakdown).toHaveLength(4);
    expect(visualization.body.platformBreakdown.every((item: any) => item.published === 4)).toBe(true);

    const page = await request(app.getHttpServer())
      .get('/api/v1/dashboard')
      .expect(200);

    expect(page.text).toContain('内容工作流');
    expect(page.text).toContain('可视化看板');
    expect(page.text).toContain('/dashboard/visualization');
  });
});
