# E2E Tests

This directory contains an HTTP-level e2e test for `POST /api/v1/demo/run`.

## Files

- `demo.e2e-spec.ts`: exercises the full demo workflow through the Nest HTTP layer.
- `fakes/workflow-store.fake.ts`: in-memory fake repository used to avoid requiring a live database during the test.
- `jest-e2e.json`: minimal Jest config for e2e execution.
- `tsconfig.e2e.json`: TypeScript config enabling decorators for Nest test compilation.

## Expected runtime dependencies

To execute these tests, the project still needs:

- `jest`
- `ts-jest`
- `@types/jest`
- `supertest`
- `@types/supertest`
- `@nestjs/testing`

## Scope

The e2e test validates:

1. The demo endpoint accepts a valid request and runs the full workflow.
2. The response contains the expected counts for sources, drafts, publish tasks, and metrics.
3. Validation rejects unexpected request fields.

The test intentionally overrides `WorkflowStoreService` and `PrismaService`, so it verifies the HTTP workflow behavior without requiring PostgreSQL.
