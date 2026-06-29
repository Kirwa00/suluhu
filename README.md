# Suluhu Therapy Center — Platform

Compliant online mental-health platform for Suluhu Therapy Center, Eldoret, Kenya.
Connects patients across the Rift Valley to CPB-licensed therapists via secure video
therapy, AI-assisted intake, clinical documentation, and M-Pesa billing.

This repository implements the product defined in
[`Suluhu_Therapy_Center_SDLC_Documentation.md`](./Suluhu_Therapy_Center_SDLC_Documentation.md),
which remains the single source of truth for requirements.

---

## Architecture at a glance

A **TypeScript monorepo** (npm workspaces + Turborepo). The SDLC document specifies an
AWS microservices topology; this build implements the same domain boundaries as a
**modular monolith** — dramatically simpler to run and deploy, and splittable into
services later without rework. (See [Architecture decisions](#architecture-decisions).)

```
apps/
  api/        NestJS modular monolith — feature modules per SDLC service boundary
  web/        Next.js (App Router) — patient, therapist & admin web app
packages/
  shared/     Framework-agnostic Zod schemas, enums, constants, API envelope types
  ui/         Design tokens (Suluhu Wellness System + Crisis Core) + shared UI
```

| Concern        | Technology                                                        |
| -------------- | ----------------------------------------------------------------- |
| Web            | Next.js 15, React 19, TypeScript, TailwindCSS, shadcn/ui          |
| Forms / data   | React Hook Form, Zod, TanStack Query                              |
| API            | NestJS 11, TypeScript, Prisma ORM                                 |
| Database       | PostgreSQL 15                                                     |
| Cache / queue  | Redis 7, BullMQ                                                   |
| Auth           | JWT (access/refresh) + RBAC + ABAC, optional MFA                  |
| i18n           | English + Swahili                                                 |
| Infra          | Docker Compose (dev), GitHub Actions CI                           |

External integrations (M-Pesa Daraja, Daily.co, OpenAI, Africa's Talking SMS, email)
sit behind **provider interfaces** with **mock adapters**, so the full platform runs
locally end-to-end with no third-party credentials (`PROVIDER_MODE=mock`).

---

## Prerequisites

- **Node.js 20+** (`.nvmrc` pins 20) and npm 10+
- **Docker** (for local PostgreSQL + Redis) — or point `DATABASE_URL` / `REDIS_URL`
  at your own instances.

## Getting started

```bash
# 1. Install dependencies (all workspaces)
npm install

# 2. Create your env file
cp .env.example .env        # then edit secrets as needed

# 3. Start infrastructure (PostgreSQL + Redis)
npm run docker:up

# 4. Generate Prisma client and run migrations
npm run db:generate
npm run db:migrate
npm run db:seed             # optional: demo therapists/patients/admin

# 5. Run everything in dev
npm run dev                 # api on :4000, web on :3000
```

- Web app: http://localhost:3000
- API: http://localhost:4000
- API docs (OpenAPI/Swagger): http://localhost:4000/docs
- Health: http://localhost:4000/api/v1/health

## Common scripts

| Command                 | Description                                  |
| ----------------------- | -------------------------------------------- |
| `npm run dev`           | Run all apps in watch mode (Turborepo)       |
| `npm run build`         | Build all workspaces                         |
| `npm run lint`          | Lint all workspaces                          |
| `npm run typecheck`     | Type-check all workspaces                    |
| `npm run test`          | Unit + integration tests                     |
| `npm run test:e2e`      | Playwright end-to-end tests                  |
| `npm run format`        | Prettier write                               |
| `npm run db:migrate`    | Apply Prisma migrations                      |
| `npm run db:seed`       | Seed demo data                               |

---

## Architecture decisions

These reconcile the SDLC document with the chosen implementation stack. They were
agreed before any code was written.

1. **Modular monolith, not microservices.** One NestJS application with feature
   modules (`auth`, `users`, `therapists`, `appointments`, `payments`, `intake`,
   `sessions`, `clinical`, `messaging`, `mood`, `content`, `notifications`, `admin`,
   `audit`) mirroring the document's 12 services. Identical domain boundaries; a
   fraction of the operational cost. Each module is dependency-isolated so it can be
   extracted into its own service if scale demands.

2. **Custom JWT + RBAC/ABAC instead of AWS Cognito.** Stateless access tokens
   (15 min) and refresh tokens (7 days), refresh-token rotation with a Redis
   blocklist, optional MFA for therapists/admins. Avoids vendor lock-in for the
   initial build.

3. **No separate Python AI service.** PHQ-9 / GAD-7 / CAGE scoring is deterministic
   arithmetic and lives in the `intake` module. The OpenAI API is called from Node
   only for the conversational intake and SOAP-draft assistants, behind an `AI`
   provider interface (mockable).

4. **Provider abstractions + mock adapters.** Every external dependency is an
   interface with a mock implementation, so the platform is fully runnable offline.

5. **Canonical design system.** The Stitch folder contained two systems; the rendered
   screens all use **Suluhu Wellness System** (deep blue `#1b4f8c` / teal `#166a59`,
   Manrope + Inter), with **Crisis Core** (adds Safety Amber) for crisis screens. The
   unused earth-toned "Serene Connection" exploration is not adopted.

## Compliance anchors (built into the platform)

- **Kenya Data Protection Act 2019** — data minimization, consent records, right to
  erasure (30-day workflow), 72-hour breach posture, field-level encryption of PHI.
- **Immutable audit trail** — all PHI access logged append-only (7-year retention).
- **ABAC** — therapists can only access records for their assigned patients.
- **Crisis protocol** — risk flags / suicidal ideation surface the Befrienders Kenya
  hotline (0800 723 253) and alert admins.

## Project status

Built milestone by milestone. See `docs/` for per-milestone design notes (SRS, ERD,
API contracts) produced alongside the code they describe.

- **M0 — Foundation** (this milestone): monorepo, tooling, design tokens, Docker
  Compose, NestJS + Next.js skeletons, CI.
- **M1 — Auth & Identity**: registration, login, OTP, MFA, RBAC/ABAC, audit base.
- Subsequent: therapist onboarding & discovery, booking & payments, intake & triage,
  sessions & video, clinical notes, messaging/mood/content, admin, notifications.
