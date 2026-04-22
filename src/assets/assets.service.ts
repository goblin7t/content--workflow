import { Injectable } from '@nestjs/common';
import { AssetDto, AssetListResponseDto, UpdateAssetDto } from './dto/asset.dto';
import { WorkflowStoreService } from '../common/services/workflow-store.service';

@Injectable()
export class AssetsService {
  constructor(private readonly store: WorkflowStoreService) {}

  async listDraftAssets(draftId: string): Promise<AssetListResponseDto> {
    return {
      items: await this.store.listAssetsByDraft(draftId),
    };
  }

  async getAsset(assetId: string): Promise<AssetDto> {
    return this.store.getAsset(assetId);
  }

  async updateAsset(assetId: string, body: UpdateAssetDto): Promise<AssetDto> {
    return this.store.updateAsset(assetId, body);
  }
}
