import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { JobsService } from '../src/jobs/jobs.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { WorkflowStoreService } from '../src/common/services/workflow-store.service';
import { WorkflowStoreFake } from './fakes/workflow-store.fake';

describe('DemoController (e2e)', () => {
  let app: any;
  let jobsService: JobsService;

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
    jobsService = app.get(JobsService);
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

  it('creates and updates a source with full editable fields', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/sources')
      .send({
        name: 'Custom Feed',
        type: 'rss',
        platform: 'facebook',
        status: 'active',
        config: {
          feedUrl: 'https://example.com/feed.xml',
          notes: 'seed',
        },
      })
      .expect(201);

    expect(created.body.name).toBe('Custom Feed');
    expect(created.body.platform).toBe('facebook');
    expect(created.body.type).toBe('rss');
    expect(created.body.config.feedUrl).toContain('example.com');

    const updated = await request(app.getHttpServer())
      .patch('/api/v1/sources/' + created.body.id)
      .send({
        name: 'Editorial Queue',
        type: 'manual',
        platform: 'xiaohongshu',
        status: 'disabled',
        config: {
          operator: 'desk',
          notes: 'manually curated',
        },
      })
      .expect(200);

    expect(updated.body.name).toBe('Editorial Queue');
    expect(updated.body.type).toBe('manual');
    expect(updated.body.platform).toBe('xiaohongshu');
    expect(updated.body.status).toBe('disabled');
    expect(updated.body.config.operator).toBe('desk');
  });

  it('queues ingestion and executes the job through the jobs API', async () => {
    const source = await request(app.getHttpServer())
      .post('/api/v1/sources')
      .send({
        name: 'Queue Feed',
        type: 'social_api',
        platform: 'tiktok',
        status: 'active',
        config: {
          account: 'queue-lab',
        },
      })
      .expect(201);

    const accepted = await request(app.getHttpServer())
      .post('/api/v1/ingestion/run')
      .expect(201);

    expect(accepted.body.status).toBe('queued');
    expect(accepted.body.jobId).toBeTruthy();

    const queuedJob = await request(app.getHttpServer())
      .get('/api/v1/jobs/' + accepted.body.jobId)
      .expect(200);

    expect(queuedJob.body.jobType).toBe('ingestion.run_all_sources');
    expect(queuedJob.body.status).toBe('queued');

    const completed = await request(app.getHttpServer())
      .post('/api/v1/jobs/' + accepted.body.jobId + '/run')
      .expect(201);

    expect(completed.body.status).toBe('succeeded');
    expect(completed.body.startedAt).toBeTruthy();
    expect(completed.body.finishedAt).toBeTruthy();

    const rawItems = await request(app.getHttpServer())
      .get('/api/v1/raw-items')
      .query({ sourceId: source.body.id })
      .expect(200);

    expect(rawItems.body.items).toHaveLength(1);

    const visualization = await request(app.getHttpServer())
      .get('/api/v1/dashboard/visualization')
      .expect(200);

    expect(visualization.body.jobs).toHaveLength(1);
    expect(visualization.body.jobs[0].status).toBe('succeeded');
  });

  it('queues metrics sync and executes it through the jobs API', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/demo/run')
      .send({
        resetStore: true,
        topicDate: '2025-02-14',
      })
      .expect(201);

    const accepted = await request(app.getHttpServer())
      .post('/api/v1/metrics/sync')
      .expect(201);

    expect(accepted.body.status).toBe('queued');

    const queuedJob = await request(app.getHttpServer())
      .get('/api/v1/jobs/' + accepted.body.jobId)
      .expect(200);

    expect(queuedJob.body.jobType).toBe('metrics.sync_all');
    expect(queuedJob.body.status).toBe('queued');

    const completed = await request(app.getHttpServer())
      .post('/api/v1/jobs/' + accepted.body.jobId + '/run')
      .expect(201);

    expect(completed.body.status).toBe('succeeded');

    const metrics = await request(app.getHttpServer())
      .get('/api/v1/metrics')
      .expect(200);

    expect(metrics.body.items.length).toBeGreaterThan(16);
  });

  it('updates review-stage publish content through channel variants', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/demo/run')
      .send({
        resetStore: true,
        topicDate: '2025-02-14',
      })
      .expect(201);

    const visualization = await request(app.getHttpServer())
      .get('/api/v1/dashboard/visualization')
      .expect(200);

    const variant = visualization.body.reviews[0].variants[0];
    expect(variant).toBeTruthy();

    const updated = await request(app.getHttpServer())
      .patch('/api/v1/channel-variants/' + variant.id)
      .send({
        title: '审核后定稿标题',
        caption: '审核阶段已手动修正文案。',
        hashtags: ['#审核', '#定稿'],
      })
      .expect(200);

    expect(updated.body.title).toBe('审核后定稿标题');
    expect(updated.body.caption).toContain('修正');
    expect(updated.body.hashtags).toEqual(['#审核', '#定稿']);
  });

  it('retries a failed job through the jobs API', async () => {
    const accepted = await jobsService.createJob({
      jobType: 'unsupported.job',
      payload: {},
    });

    await request(app.getHttpServer())
      .post('/api/v1/jobs/' + accepted.jobId + '/run')
      .expect(201);

    const retried = await request(app.getHttpServer())
      .post('/api/v1/jobs/' + accepted.jobId + '/retry')
      .expect(201);

    expect(retried.body.status).toBe('queued');
    expect(retried.body.errorMessage).toBeUndefined();
  });

  it('serves dashboard visualization data and page', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/demo/run')
      .send({
        resetStore: true,
        topicDate: '2025-02-14',
      })
      .expect(201);

    const visualization = await request(app.getHttpServer())
      .get('/api/v1/dashboard/visualization')
      .expect(200);

    expect(visualization.body.overview.rawItemsCount).toBe(4);
    expect(visualization.body.totals.normalizedItemsCount).toBe(4);
    expect(visualization.body.sources).toHaveLength(4);
    expect(visualization.body.drafts).toHaveLength(4);
    expect(visualization.body.reviews).toHaveLength(4);
    expect(visualization.body.publishes).toHaveLength(16);
    expect(visualization.body.publishCandidates).toHaveLength(0);
    expect(visualization.body.platformBreakdown).toHaveLength(4);
    expect(visualization.body.platformBreakdown.every((item: any) => item.published === 4)).toBe(true);

    const filteredVisualization = await request(app.getHttpServer())
      .get('/api/v1/dashboard/visualization')
      .query({
        date: '2025-02-14',
        platform: 'tiktok',
        publishStatus: 'published',
      })
      .expect(200);

    expect(filteredVisualization.body.sources).toHaveLength(1);
    expect(filteredVisualization.body.sources[0].platform).toBe('tiktok');
    expect(filteredVisualization.body.drafts).toHaveLength(1);
    expect(filteredVisualization.body.reviews).toHaveLength(1);
    expect(filteredVisualization.body.publishes).toHaveLength(1);
    expect(filteredVisualization.body.publishes[0].platform).toBe('tiktok');
    expect(filteredVisualization.body.platformBreakdown).toHaveLength(1);
    expect(filteredVisualization.body.platformBreakdown[0].platform).toBe('tiktok');

    const page = await request(app.getHttpServer())
      .get('/api/v1/dashboard')
      .expect(200);

    expect(page.text).toContain('内容工作流');
    expect(page.text).toContain('管理面板');
    expect(page.text).toContain('/dashboard/visualization');
    expect(page.text).toContain('platformFilter');
    expect(page.text).toContain('applyFiltersBtn');
    expect(page.text).toContain('feedback');
    expect(page.text).toContain('stageNav');
    expect(page.text).toContain('流程控制');
    expect(page.text).toContain('overviewDetail');
    expect(page.text).toContain('sourceDetail');
    expect(page.text).toContain('运行采集');
    expect(page.text).toContain('同步指标');
    expect(page.text).toContain('查看任务');
    expect(page.text).toContain('同步来源');
    expect(page.text).toContain('任务');
    expect(page.text).toContain('jobDetail');
    expect(page.text).toContain('jobStatusStageFilter');
    expect(page.text).toContain('重新入队');
    expect(page.text).toContain('修改内容');
    expect(page.text).toContain('展开编辑');
    expect(page.text).toContain('刚保存');
    expect(page.text).toContain('复制到全部其他平台');
    expect(page.text).toContain('保存发布内容');
    expect(page.text).toContain('新建来源');
    expect(page.text).toContain('编辑来源');
    expect(page.text).toContain('保存来源');
    expect(page.text).toContain('采集任务已入队');
    expect(page.text).toContain('topicDetail');
    expect(page.text).toContain('topicSort');
    expect(page.text).toContain('候选素材');
    expect(page.text).toContain('素材详情');
    expect(page.text).toContain('主素材');
    expect(page.text).toContain('展开原文');
    expect(page.text).toContain('选中');
    expect(page.text).toContain('draftDetail');
    expect(page.text).toContain('渲染素材');
    expect(page.text).toContain('reviewDetail');
    expect(page.text).toContain('通过');
    expect(page.text).toContain('publishDetail');
    expect(page.text).toContain('创建任务');
    expect(page.text).toContain('发布');
  });
});
