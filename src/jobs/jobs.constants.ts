export const JOB_STATUS = {
  QUEUED: 'queued',
  RUNNING: 'running',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export const JOB_TYPE = {
  INGESTION_RUN_ALL_SOURCES: 'ingestion.run_all_sources',
} as const;
