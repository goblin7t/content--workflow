import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { JobsRunnerService } from './jobs.runner';

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });
  const runner = app.get(JobsRunnerService);
  const pollMs = Number(process.env.JOB_POLL_MS || 2000);

  process.on('SIGINT', async () => {
    await app.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await app.close();
    process.exit(0);
  });

  console.log(`Job worker started. Polling every ${pollMs}ms.`);

  while (true) {
    const job = await runner.runNextQueuedJob();
    if (job) {
      console.log(`Processed job ${job.id} (${job.jobType}) -> ${job.status}`);
      continue;
    }

    await sleep(pollMs);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
