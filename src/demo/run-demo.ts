import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DemoService } from './demo.service';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const demoService = app.get(DemoService);
    const result = await demoService.runDemo({ resetStore: true });
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await app.close();
  }
}

void run();
