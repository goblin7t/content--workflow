import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { DemoService } from './demo.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkflowStoreService } from '../common/services/workflow-store.service';
import { WorkflowStoreFake } from '../../test/fakes/workflow-store.fake';

async function bootstrap() {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue({
      onModuleInit: async () => undefined,
      onModuleDestroy: async () => undefined,
      enableShutdownHooks: async () => undefined,
    })
    .overrideProvider(WorkflowStoreService)
    .useClass(WorkflowStoreFake)
    .compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const demoService = moduleRef.get(DemoService);
  await demoService.runDemo({
    resetStore: true,
    topicDate: '2025-02-14',
  });

  await app.listen(3000);
  console.log('Dashboard preview is running at http://localhost:3000/api/v1/dashboard');
}

void bootstrap();
