# Demo Workflow

This project includes an end-to-end demo orchestration for the content workflow skeleton.

## Prerequisites

- `DATABASE_URL` must point to a PostgreSQL database.
- Prisma migrations must be applied before running the demo flow.
- The project must have generated Prisma client code available.

## API entry

Run:

`POST /api/v1/demo/run`

Request body example:

```json
{
  "resetStore": true,
  "topicDate": "2025-02-14"
}
```

What it does:

1. Seeds four example sources.
2. Runs ingestion and normalization.
3. Generates `3` summary topics and `1` deep-dive topic.
4. Creates drafts, renders assets, and builds channel variants for `xiaohongshu`, `douyin`, `tiktok`, and `facebook`.
5. Submits and approves review tasks.
6. Creates and runs publish tasks for each platform variant.
7. Syncs one round of metrics snapshots.

## Script entry

Use the standalone script at:

`src/demo/run-demo.ts`

It bootstraps a Nest application context, runs the same workflow, and prints a JSON summary.

## Notes

- The current implementation persists workflow state through `PrismaService` and PostgreSQL.
- Business rules still apply during the demo, including source reference checks and publish idempotency checks.
- The demo script resets workflow tables by default before seeding sample data.

## Dashboard

Start the API server:

`npm run start`

Open:

`http://localhost:3000/api/v1/dashboard`

The page provides a local workflow dashboard for collection, normalization, topic selection, draft generation, manual review, multi-platform publishing, and basic performance metrics.

Related JSON endpoints:

- `GET /api/v1/dashboard/overview`
- `GET /api/v1/dashboard/visualization`
