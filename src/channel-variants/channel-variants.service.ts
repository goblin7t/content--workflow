import { Injectable } from '@nestjs/common';
import {
  ChannelVariantDto,
  ChannelVariantListResponseDto,
  ListChannelVariantsQueryDto,
  UpdateChannelVariantDto,
} from './dto/channel-variant.dto';
import { WorkflowStoreService } from '../common/services/workflow-store.service';

@Injectable()
export class ChannelVariantsService {
  constructor(private readonly store: WorkflowStoreService) {}

  async listChannelVariants(query: ListChannelVariantsQueryDto): Promise<ChannelVariantListResponseDto> {
    return { items: await this.store.listChannelVariants(query) };
  }

  async getChannelVariant(channelVariantId: string): Promise<ChannelVariantDto> {
    return this.store.getChannelVariant(channelVariantId);
  }

  async updateChannelVariant(channelVariantId: string, body: UpdateChannelVariantDto): Promise<ChannelVariantDto> {
    return this.store.updateChannelVariant(channelVariantId, body);
  }
}
