# AWS Target Architecture — Standing

## Overview

Standing is a relationship-command application currently running on ChatGPT
Sites / Vinext / Cloudflare Workers. This document describes the target
architecture for running Standing as a standard containerised Next.js application
on AWS.

## Boundary mapping

| Current boundary | AWS-ready target |
|---|---|
| ChatGPT Sites / Vinext / Cloudflare Worker | Standard Next.js Node container on ECS Fargate |
| Sites sign-in headers | Dedicated Auth0 application with server-side sessions |
| Mutable email tenant key | Stable Auth0 `sub` owner identifier |
| Cloudflare D1 / SQLite | PostgreSQL on RDS or Aurora via `DATABASE_URL` |
| Sites environment bindings | ECS environment configuration and AWS Secrets Manager |
| Sites deployment | Docker image → ECR → ECS service behind an ALB |
| Sites logs | ECS / CloudWatch Logs |

## Authentication and authorization

- Auth0 is the identity provider. The application uses the Auth0 Next.js SDK
  (`@auth0/nextjs-auth0`) with server-side session cookies.
- The stable `sub` claim from the Auth0 ID token is the tenant/owner identifier
  for all database rows. It never changes even if the user updates their email.
- Email and display name are stored separately as mutable profile fields and
  refreshed from the session on each request.
- API routes and server components derive identity exclusively from the verified
  server-side session. No owner ID or email submitted by the browser is trusted.
- Unauthenticated requests to API routes receive `401 Unauthorized`.
- Auth0 manages `/api/auth/login`, `/api/auth/logout`, and `/api/auth/callback`.
  These paths are reserved and must not be used by application routes.

## Tenant isolation

- Every database row carries an `owner_id` column populated from the Auth0 `sub`
  claim.
- All queries include a `WHERE owner_id = $ownerId` predicate enforced
  server-side. No client-supplied owner value is accepted.
- Row-level isolation is the only tenancy boundary in this single-tenant
  deployment model; multi-tenant expansion requires a separate design review.

## Database

- PostgreSQL on Amazon RDS (or Aurora PostgreSQL-compatible) replaces
  Cloudflare D1 / SQLite.
- The application connects via `DATABASE_URL` (standard libpq connection string).
- Drizzle ORM with the `drizzle-orm/node-postgres` adapter.
- A connection pool sized for Next.js development reloads and normal ECS
  operation (e.g. `pg` pool with `max: 10`).
- The database is not contacted during `next build`; all schema access is
  deferred to request time.
- Migrations are managed with `drizzle-kit` and applied explicitly before
  deploying a new image.

## Required AWS resources

| Resource | Purpose |
|---|---|
| ECR repository | Stores Docker images |
| ECS cluster (Fargate) | Runs the Next.js container |
| ECS task definition | Declares CPU, memory, image, env, secrets |
| ECS service | Maintains desired task count, rolling deploys |
| Application Load Balancer | TLS termination, health-check routing |
| ACM certificate | TLS for the ALB listener |
| RDS / Aurora PostgreSQL | Persistent relational storage |
| AWS Secrets Manager | Auth0 credentials, DB password, session secret |
| CloudWatch Log Group | Container stdout/stderr |
| VPC, subnets, security groups | Network isolation |

## Environment variables

Documented in `.env.example`. At runtime these are injected via ECS task
environment / Secrets Manager references:

| Variable | Source at runtime |
|---|---|
| `AUTH0_DOMAIN` | Secrets Manager |
| `AUTH0_CLIENT_ID` | Secrets Manager |
| `AUTH0_CLIENT_SECRET` | Secrets Manager |
| `AUTH0_SECRET` | Secrets Manager (random 32-byte hex) |
| `APP_BASE_URL` | ECS environment (e.g. `https://standing.example.com`) |
| `DATABASE_URL` | Secrets Manager |

## Secrets handling

- No secrets are stored in the repository or Docker image.
- Secrets Manager secrets are referenced in the ECS task definition using the
  `secrets` field; ECS injects them as environment variables at task start.
- The `AUTH0_SECRET` value is a randomly generated secret used to encrypt the
  session cookie. Rotate it to invalidate all active sessions.

## Health checking

- `GET /api/health` returns `200 {"status":"ok"}`.
- The ALB target group health check polls `/api/health` every 30 seconds.
- The endpoint does not disclose secrets, database state, or infrastructure
  details.

## Container

- Multi-stage `Dockerfile`: builder stage runs `next build`, runner stage copies
  the standalone output.
- Next.js `output: "standalone"` produces a self-contained Node server under
  `.next/standalone`.
- `.dockerignore` excludes `node_modules`, `.next`, `.env*`, and other
  non-essential files from the build context.
- Image is pushed to ECR and referenced by digest in the ECS task definition.

## Deployment stages

1. Build and push Docker image to ECR (`docker build` → `docker push`).
2. Apply pending Drizzle migrations against the target database.
3. Update the ECS task definition with the new image digest.
4. Trigger an ECS service update (rolling deploy, minimum healthy percent 100%).
5. ALB health checks confirm the new tasks are healthy before draining old ones.

## Rollback strategy

- ECS service can be updated to the previous task definition revision in under
  two minutes.
- If a migration is destructive, a compensating migration must be prepared before
  deploying. Schema changes should be backward-compatible across at least one
  deploy cycle (expand/contract pattern).
- ECR retains previous image tags for rapid re-deploy.

## Acceptance criteria

- `npm test` and `npm run build` pass locally without live AWS credentials.
- `GET /api/health` returns `200` from the running container.
- An authenticated user can load the workspace, persist thread state, add
  contact notes, and save drafts; all rows are scoped to their `owner_id`.
- An unauthenticated request to any `/api/workspace/*` route returns `401`.
- `next build` completes without a live database connection.
- The Docker image builds successfully with `docker build`.

## Explicitly deferred work

- Live mailbox integration (Gmail, Microsoft 365, SES inbound).
- Production email sending.
- Actual AWS resource provisioning (VPC, RDS, ECS, ALB, ECR, ACM, Secrets
  Manager). This requires separate explicit approval and is not performed in
  this repository.
- CDK / Terraform / CloudFormation infrastructure-as-code.
- Multi-tenant isolation beyond row-level `owner_id` scoping.
- Auth0 organization or workspace-membership enforcement.
- CI/CD pipeline configuration.
