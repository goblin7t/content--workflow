import { Injectable } from '@nestjs/common';
import { DraftType, PlatformType, SourceType } from '../common/enums/workflow.enums';
import { WorkflowStoreService } from '../common/services/workflow-store.service';
import { nowIso } from '../common/utils/workflow.helpers';
import { DraftDto } from '../drafts/dto/draft.dto';
import { DraftsService } from '../drafts/drafts.service';
import { IngestionService } from '../ingestion/ingestion.service';
import { MetricsService } from '../metrics/metrics.service';
import { NormalizationService } from '../normalization/normalization.service';
import { PublishService } from '../publish/publish.service';
import { ReviewService } from '../review/review.service';
import { SourcesService } from '../sources/sources.service';
import { TopicsService } from '../topics/topics.service';
import { DemoRunResultDto, RunDemoRequestDto } from './dto/demo.dto';

@Injectable()
export class DemoService {
  constructor(
    private readonly store: WorkflowStoreService,
    private readonly sourcesService: SourcesService,
    private readonly ingestionService: IngestionService,
    private readonly normalizationService: NormalizationService,
    private readonly topicsService: TopicsService,
    private readonly draftsService: DraftsService,
    private readonly reviewService: ReviewService,
    private readonly publishService: PublishService,
    private readonly metricsService: MetricsService,
  ) {}

  async runDemo(body: RunDemoRequestDto = {}): Promise<DemoRunResultDto> {
    if (body.resetStore ?? true) {
      await this.store.reset();
    }

    const sourceIds = await this.seedSources();

    await this.ingestionService.runIngestion();
    await this.normalizationService.runNormalization();

    const topicDate = body.topicDate ?? nowIso().slice(0, 10);
    const generatedTopics = await this.topicsService.generateTopics({
      date: topicDate,
      targetSummaryCount: 3,
      targetDeepCount: 1,
    });

    const drafts: DraftDto[] = [];
    for (const [index, topic] of generatedTopics.items.slice(0, 4).entries()) {
      await this.topicsService.selectTopic(topic.id);

      const draft = await this.draftsService.generateDraft({
        topicId: topic.id,
        draftType: index === 3 ? DraftType.DEEP : DraftType.SUMMARY,
        tone: index === 3 ? 'insightful' : 'professional',
        languageCode: 'zh-CN',
      });

      await this.draftsService.renderDraft(draft.id, {
        template: index === 3 ? 'deep-dive-carousel' : 'daily-summary-card',
        pageCount: index === 3 ? 8 : 6,
        size: '1080x1440',
      });

      await this.draftsService.createChannelVariants(draft.id, {
        platforms: [
          PlatformType.XIAOHONGSHU,
          PlatformType.DOUYIN,
          PlatformType.TIKTOK,
          PlatformType.FACEBOOK,
        ],
      });

      const reviewTask = await this.draftsService.submitReview(draft.id);
      await this.reviewService.approveReviewTask(reviewTask.id, {
        selectedPlatforms: [
          PlatformType.XIAOHONGSHU,
          PlatformType.DOUYIN,
          PlatformType.TIKTOK,
          PlatformType.FACEBOOK,
        ],
      });

      drafts.push(await this.draftsService.getDraft(draft.id));
    }

    for (const draft of drafts) {
      const variants = await this.store.listChannelVariants({ draftId: draft.id });
      for (const variant of variants) {
        const task = await this.publishService.createPublishTask(`demo-create-${variant.id}`, {
          channelVariantId: variant.id,
          platform: variant.platform,
        });
        await this.publishService.runPublishTask(task.id, `demo-run-${task.id}`);
      }
    }

    await this.metricsService.syncMetrics();
    const publishTasks = await this.store.listPublishTasks({});
    const metrics = await this.store.listMetrics({});

    return {
      sourceIds,
      rawItemsCount: await this.store.countRawItems(),
      normalizedItemsCount: (await this.store.listNormalizedItems({})).length,
      drafts: await Promise.all(drafts.map(async (draft) => ({
        draftId: draft.id,
        title: draft.title ?? 'Untitled',
        draftType: draft.draftType,
        sourceRefCount: draft.sourceRefs.length,
        assetCount: (await this.store.listAssetsByDraft(draft.id)).length,
      }))),
      publishTasks: publishTasks.map((task) => ({
        publishTaskId: task.id,
        platform: task.platform,
        status: task.status,
        remotePostId: task.remotePostId,
      })),
      metrics: metrics.map((metric) => ({
        publishTaskId: metric.publishTaskId,
        platform: metric.platform,
        views: metric.views,
      })),
    };
  }

  private async seedSources(): Promise<string[]> {
    const seedDefinitions = [
      { name: 'AI Industry RSS', type: SourceType.RSS, platform: 'rss', config: { feeds: ['https://example.com/rss/ai.xml'] } },
      { name: 'Creator Trend Feed', type: SourceType.SOCIAL_API, platform: 'tiktok', config: { account: 'creator-lab' } },
      { name: 'Short Video Signal Feed', type: SourceType.SOCIAL_API, platform: 'douyin', config: { account: 'trend-watch' } },
      { name: 'Global Social Pulse', type: SourceType.SOCIAL_API, platform: 'facebook', config: { page: 'industry-insight' } },
    ] as const;

    return Promise.all(seedDefinitions.map(async (definition) =>
      (await this.sourcesService.createSource({
        name: definition.name,
        type: definition.type,
        platform: definition.platform,
        config: definition.config,
      })).id,
    ));
  }
}
