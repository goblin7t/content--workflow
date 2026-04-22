import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ChannelVariantListResponseDto } from '../channel-variants/dto/channel-variant.dto';
import { JobAcceptedResponseDto } from '../common/dto/common.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
import { DraftsService } from './drafts.service';

@ApiTags('Drafts')
@ApiBearerAuth()
@Controller()
export class DraftsController {
  constructor(private readonly draftsService: DraftsService) {}

  @Get('drafts')
  @ApiOperation({ summary: 'List drafts' })
  listDrafts(@Query() query: ListDraftsQueryDto): Promise<DraftListResponseDto> {
    return this.draftsService.listDrafts(query);
  }

  @Post('drafts/generate')
  @ApiOperation({ summary: 'Generate a draft from a topic' })
  createDraft(@Body() body: GenerateDraftDto): Promise<DraftDto> {
    return this.draftsService.generateDraft(body);
  }

  @Get('drafts/:draftId')
  @ApiOperation({ summary: 'Get a draft' })
  getDraft(@Param('draftId') draftId: string): Promise<DraftDto> {
    return this.draftsService.getDraft(draftId);
  }

  @Patch('drafts/:draftId')
  @ApiOperation({ summary: 'Update a draft' })
  updateDraft(@Param('draftId') draftId: string, @Body() body: UpdateDraftDto): Promise<DraftDto> {
    return this.draftsService.updateDraft(draftId, body);
  }

  @Post('drafts/:draftId/regenerate')
  @ApiOperation({ summary: 'Regenerate a draft' })
  regenerateDraft(@Param('draftId') draftId: string): Promise<JobAcceptedResponseDto> {
    return this.draftsService.regenerateDraft(draftId);
  }

  @Post('drafts/:draftId/submit-review')
  @ApiOperation({ summary: 'Submit a draft for review' })
  submitReview(@Param('draftId') draftId: string): Promise<ReviewTaskDto> {
    return this.draftsService.submitReview(draftId);
  }

  @Post('drafts/:draftId/render')
  @ApiOperation({ summary: 'Render assets for a draft' })
  renderDraft(
    @Param('draftId') draftId: string,
    @Body() body: RenderDraftDto,
  ): Promise<JobAcceptedResponseDto> {
    return this.draftsService.renderDraft(draftId, body);
  }

  @Post('drafts/:draftId/channel-variants')
  @ApiOperation({ summary: 'Generate platform-specific variants for a draft' })
  createChannelVariants(
    @Param('draftId') draftId: string,
    @Body() body: CreateChannelVariantsDto,
  ): Promise<ChannelVariantListResponseDto> {
    return this.draftsService.createChannelVariants(draftId, body);
  }
}
