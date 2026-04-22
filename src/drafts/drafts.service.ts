import { ConflictException, Injectable } from '@nestjs/common';
import { ChannelVariantListResponseDto, ChannelVariantDto } from '../channel-variants/dto/channel-variant.dto';
import { JobAcceptedResponseDto, SourceReferenceDto } from '../common/dto/common.dto';
import {
  AssetType,
  DraftStatus,
  DraftType,
  PlatformType,
  PublishMode,
  ReviewStatus,
} from '../common/enums/workflow.enums';
import { WorkflowStoreService } from '../common/services/workflow-store.service';
import { newId, nowIso, queueJob } from '../common/utils/workflow.helpers';
import { ReviewTaskDto } from '../review/dto/review.dto';
import {
  CreateChannelVariantsDto,
  DraftDto,
  DraftListResponseDto,
  GenerateDraftDto,
  ListDraftsQueryDto,
  RenderDraftDto,
  UpdateDraftDto,
} from './dto/draft.dto';

@Injectable()
export class DraftsService {
  constructor(private readonly store: WorkflowStoreService) {}

  async listDrafts(query: ListDraftsQueryDto): Promise<DraftListResponseDto> {
    return { items: await this.store.listDrafts(query) };
  }

  async generateDraft(body: GenerateDraftDto): Promise<DraftDto> {
    const topic = await this.store.getTopic(body.topicId);

    const sourceRefs = await this.buildSourceReferences(topic.clusterPayload.normalizedItemIds as string[] | undefined);
    if (sourceRefs.length === 0) {
      throw new ConflictException('Draft generation requires at least one source reference candidate');
    }

    const now = nowIso();
    return this.store.createDraft({
      id: newId(),
      topicId: topic.id,
      draftType: body.draftType,
      languageCode: body.languageCode,
      tone: body.tone,
      title: body.draftType === DraftType.DEEP ? `${topic.title} deep dive` : topic.title,
      outline: [
        { heading: 'What happened' },
        { heading: body.draftType === DraftType.DEEP ? 'Why it matters' : 'Key takeaway' },
      ],
      body: `${topic.summary ?? topic.title}\n\nGenerated from normalized source material.`,
      facts: [
        {
          label: 'topic_score',
          value: topic.score,
        },
      ],
      sourceRefs,
      version: 1,
      status: DraftStatus.DRAFT,
      createdAt: now,
      updatedAt: now,
    });
  }

  async getDraft(draftId: string): Promise<DraftDto> {
    return this.store.getDraft(draftId);
  }

  async updateDraft(draftId: string, body: UpdateDraftDto): Promise<DraftDto> {
    if (body.sourceRefs && body.sourceRefs.length === 0) {
      throw new ConflictException('Draft sourceRefs cannot be empty');
    }

    return this.store.updateDraft(draftId, body);
  }

  async regenerateDraft(draftId: string): Promise<JobAcceptedResponseDto> {
    const draft = await this.store.getDraft(draftId);
    await this.store.updateDraft(draftId, {
      status: DraftStatus.DRAFT,
      version: draft.version + 1,
    });
    return queueJob();
  }

  async submitReview(draftId: string): Promise<ReviewTaskDto> {
    const draft = await this.store.getDraft(draftId);
    if (draft.sourceRefs.length === 0) {
      throw new ConflictException('Draft must include at least one source reference before review');
    }

    const existing = await this.store.findReviewTaskByDraft(draftId);
    if (existing) {
      return existing;
    }

    const reviewTask = await this.store.createReviewTask({
      draftId: draft.id,
      status: ReviewStatus.PENDING,
    });
    await this.store.updateDraft(draftId, { status: DraftStatus.IN_REVIEW });
    return reviewTask;
  }

  async renderDraft(draftId: string, body: RenderDraftDto): Promise<JobAcceptedResponseDto> {
    const draft = await this.store.getDraft(draftId);
    const now = nowIso();
    const [width, height] = body.size.split('x').map(Number);

    await this.store.createAsset({
      id: newId(),
      draftId: draft.id,
      assetType: AssetType.COVER,
      storageUrl: `https://assets.example.com/${draft.id}/cover.png`,
      width,
      height,
      mimeType: 'image/png',
      templateName: body.template,
      metadata: {
        generatedAt: now,
      },
      createdAt: now,
    });

    for (let pageNo = 1; pageNo <= body.pageCount; pageNo += 1) {
      await this.store.createAsset({
        id: newId(),
        draftId: draft.id,
        assetType: AssetType.PAGE,
        pageNo,
        storageUrl: `https://assets.example.com/${draft.id}/page-${pageNo}.png`,
        width,
        height,
        mimeType: 'image/png',
        templateName: body.template,
        metadata: {
          generatedAt: now,
          pageNo,
        },
        createdAt: now,
      });
    }

    await this.store.updateDraft(draftId, { status: DraftStatus.RENDERED });
    return queueJob();
  }

  async createChannelVariants(draftId: string, body: CreateChannelVariantsDto): Promise<ChannelVariantListResponseDto> {
    const draft = await this.store.getDraft(draftId);
    const assets = await this.store.listAssetsByDraft(draft.id);
    const resolvedCoverAsset = assets.find((asset) => asset.assetType === AssetType.COVER);
    const now = nowIso();

    const items: ChannelVariantDto[] = [];
    for (const platform of body.platforms) {
      const existing = await this.store.findChannelVariantByDraftAndPlatform(draft.id, platform);

      if (existing) {
        items.push(existing);
        continue;
      }

      const variant = await this.store.createChannelVariant({
        draftId: draft.id,
        platform,
        title: `${draft.title ?? 'Untitled'} | ${platform}`,
        caption: `Platform copy for ${platform}. Built from curated facts, not the generic draft body.`,
        hashtags: [`#${platform}`, '#industry', '#summary'],
        coverAssetId: resolvedCoverAsset?.id,
        assetBundle: assets.map((asset) => asset.id),
        publishMode: this.resolvePublishMode(platform),
        status: 'draft',
        createdAt: now,
        updatedAt: now,
      });
      items.push(variant);
    }

    return { items };
  }

  private async buildSourceReferences(normalizedItemIds: string[] | undefined): Promise<SourceReferenceDto[]> {
    const ids =
      normalizedItemIds ??
      (await this.store.listLatestNormalizedItems(1)).map((item) => item.id);
    const normalizedItems = await this.store.getNormalizedItemsByIds(ids);
    const refs = await Promise.all(
      normalizedItems.map(async (item) => {
        const rawItem = await this.store.getRawItem(item.rawItemId);
        const source = await this.store.getSource(rawItem.sourceId);

        return {
          sourceId: source.id,
          normalizedItemId: item.id,
          title: item.cleanTitle ?? rawItem.title ?? source.name,
          url: rawItem.url,
          publishedAt: rawItem.publishedAt,
        };
      }),
    );

    return refs;
  }

  private resolvePublishMode(platform: PlatformType): PublishMode {
    if (platform === PlatformType.TIKTOK || platform === PlatformType.FACEBOOK) {
      return PublishMode.DIRECT_API;
    }

    return PublishMode.SEMI_AUTO;
  }
}
