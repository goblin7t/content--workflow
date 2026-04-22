import { Module } from '@nestjs/common';
import { ContentWorkflowModule } from './content-workflow.module';

@Module({
  imports: [ContentWorkflowModule],
})
export class AppModule {}
