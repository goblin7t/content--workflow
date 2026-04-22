import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DemoService } from './demo.service';
import { DemoRunResultDto, RunDemoRequestDto } from './dto/demo.dto';

@ApiTags('Demo')
@ApiBearerAuth()
@Controller('demo')
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @Post('run')
  @ApiOperation({ summary: 'Run the end-to-end demo workflow' })
  runDemo(@Body() body: RunDemoRequestDto): Promise<DemoRunResultDto> {
    return this.demoService.runDemo(body);
  }
}
