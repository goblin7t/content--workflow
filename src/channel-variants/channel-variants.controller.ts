import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ChannelVariantDto,
  ChannelVariantListResponseDto,
  ListChannelVariantsQueryDto,
  UpdateChannelVariantDto,
} from './dto/channel-variant.dto';
import { ChannelVariantsService } from './channel-variants.service';

@ApiTags('ChannelVariants')
@ApiBearerAuth()
@Controller()
export class ChannelVariantsController {
  constructor(private readonly channelVariantsService: ChannelVariantsService) {}

  @Get('channel-variants')
  @ApiOperation({ summary: 'List channel variants' })
  listChannelVariants(
    @Query() query: ListChannelVariantsQueryDto,
  ): Promise<ChannelVariantListResponseDto> {
    return this.channelVariantsService.listChannelVariants(query);
  }

  @Get('channel-variants/:channelVariantId')
  @ApiOperation({ summary: 'Get a channel variant' })
  getChannelVariant(@Param('channelVariantId') channelVariantId: string): Promise<ChannelVariantDto> {
    return this.channelVariantsService.getChannelVariant(channelVariantId);
  }

  @Patch('channel-variants/:channelVariantId')
  @ApiOperation({ summary: 'Update a channel variant' })
  updateChannelVariant(
    @Param('channelVariantId') channelVariantId: string,
    @Body() body: UpdateChannelVariantDto,
  ): Promise<ChannelVariantDto> {
    return this.channelVariantsService.updateChannelVariant(channelVariantId, body);
  }
}
