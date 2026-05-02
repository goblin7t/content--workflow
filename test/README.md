# Tests

This directory contains both service-level integration coverage and HTTP-level e2e coverage for the demo workflow.

## Commands

- `npm run test:integration`: runs service-level integration tests without opening a local listening port. This is the safest option in restricted or sandboxed environments.
- `npm run test:e2e:demo`: runs the HTTP-level demo e2e test. This starts the Nest test server and needs permission to bind a local port.

## Files

- `workflow.integration-spec.ts`: verifies the demo workflow and dashboard aggregation through Nest services without using HTTP.
- `publish-review.integration-spec.ts`: exercises publish and review service edge cases such as idempotency, platform mismatches, and review state transitions.
- `demo.e2e-spec.ts`: exercises the full demo workflow through the Nest HTTP layer.
- `fakes/workflow-store.fake.ts`: in-memory fake repository used to avoid requiring a live database during the test.
- `jest-integration.json`: Jest config for service-level integration execution.
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

The integration test validates:

1. The demo service runs the full workflow and returns the expected counts.
2. The dashboard service builds the expected visualization aggregates from generated workflow state.
3. Publish and review services enforce idempotency, platform prerequisites, and expected draft/review status changes.

The e2e test validates:

1. The demo endpoint accepts a valid request and runs the full workflow.
2. The response contains the expected counts for sources, drafts, publish tasks, and metrics.
3. Validation rejects unexpected request fields.

The test intentionally overrides `WorkflowStoreService` and `PrismaService`, so it verifies the HTTP workflow behavior without requiring PostgreSQL.

## Environment note

If `npm run test:e2e:demo` fails with an error such as `listen EPERM`, the code may still be correct. That error usually means the current environment does not allow binding a local port. In that case:

1. Use `npm run test:integration` for restricted environments.
2. Re-run `npm run test:e2e:demo` in a normal local shell or an environment with local network permissions.
