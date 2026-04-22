import { Module } from '@nestjs/common';
import { AssetsController } from './assets/assets.controller';
import { AssetsService } from './assets/assets.service';
import { ChannelVariantsController } from './channel-variants/channel-variants.controller';
import { ChannelVariantsService } from './channel-variants/channel-variants.service';
import { WorkflowStoreService } from './common/services/workflow-store.service';
import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';
import { DemoController } from './demo/demo.controller';
import { DemoService } from './demo/demo.service';
import { DraftsController } from './drafts/drafts.controller';
import { DraftsService } from './drafts/drafts.service';
import { IngestionController } from './ingestion/ingestion.controller';
import { IngestionService } from './ingestion/ingestion.service';
import { MetricsController } from './metrics/metrics.controller';
import { MetricsService } from './metrics/metrics.service';
import { NormalizationController } from './normalization/normalization.controller';
import { NormalizationService } from './normalization/normalization.service';
import { PublishController } from './publish/publish.controller';
import { PublishService } from './publish/publish.service';
import { PrismaService } from './prisma/prisma.service';
import { ReviewController } from './review/review.controller';
import { ReviewService } from './review/review.service';
import { SourcesController } from './sources/sources.controller';
import { SourcesService } from './sources/sources.service';
import { TopicsController } from './topics/topics.controller';
import { TopicsService } from './topics/topics.service';

@Module({
  controllers: [
    AssetsController,
    ChannelVariantsController,
    DashboardController,
    DemoController,
    DraftsController,
    IngestionController,
    MetricsController,
    NormalizationController,
    PublishController,
    ReviewController,
    SourcesController,
    TopicsController,
  ],
  providers: [
    AssetsService,
    ChannelVariantsService,
    DashboardService,
    DemoService,
    DraftsService,
    IngestionService,
    MetricsService,
    NormalizationService,
    PublishService,
    PrismaService,
    ReviewService,
    SourcesService,
    TopicsService,
    WorkflowStoreService,
  ],
})
export class ContentWorkflowModule {}
