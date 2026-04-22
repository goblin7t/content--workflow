import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AssetDto, AssetListResponseDto, UpdateAssetDto } from './dto/asset.dto';
import { AssetsService } from './assets.service';

@ApiTags('Assets')
@ApiBearerAuth()
@Controller()
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get('drafts/:draftId/assets')
  @ApiOperation({ summary: 'List draft assets' })
  listDraftAssets(@Param('draftId') draftId: string): Promise<AssetListResponseDto> {
    return this.assetsService.listDraftAssets(draftId);
  }

  @Get('assets/:assetId')
  @ApiOperation({ summary: 'Get a single asset' })
  getAsset(@Param('assetId') assetId: string): Promise<AssetDto> {
    return this.assetsService.getAsset(assetId);
  }

  @Patch('assets/:assetId')
  @ApiOperation({ summary: 'Update asset metadata' })
  updateAsset(@Param('assetId') assetId: string, @Body() body: UpdateAssetDto): Promise<AssetDto> {
    return this.assetsService.updateAsset(assetId, body);
  }
}
