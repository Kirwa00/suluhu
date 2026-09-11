---
name: testing-suluhu-local
description: How to run and end-to-end test the Suluhu Therapy Center monorepo locally (mock providers) — env setup gotchas, demo logins, OTP retrieval, and how to force a bookable/joinable appointment for consult-room (video) testing.
---

# Testing Suluhu locally (mock mode)

## Bring the stack up

```bash
cd ~/repos/suluhu
cp .env.example .env        # only if .env is missing
npm install
npm run docker:up           # Postgres (container suluhu-postgres) + Redis (suluhu-redis)
npm run db:generate && npm run db:migrate && npm run db:seed
nohup npm run dev > /tmp/dev.log 2>&1 &
```

Web http://localhost:3000, API http://localhost:4000 (`/api/v1/health`, Swagger `/docs`).

### .env notes
- An unmodified `cp .env.example .env` now boots and migrates: it ships `DIRECT_URL`, a
  throwaway dev `PHI_ENCRYPTION_KEY`, and blank live-only credentials are ignored.
- The Prisma CLI does not read the repo-root `.env` itself; the `db:*` scripts load it via
  `apps/api/scripts/with-root-env.mjs`, so run migrations through `npm run db:migrate`
  (not bare `npx prisma migrate deploy`, which fails on `DIRECT_URL`).
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` must be 32+ chars; `PHI_ENCRYPTION_KEY` must
  decode from base64 to exactly 32 bytes.
- Keep `PROVIDER_MODE=mock`, `MPESA_MODE=mock`, `VIDEO_MODE=mock` to run fully offline.
  `VIDEO_MODE=live` requires `DAILY_API_KEY` + `DAILY_DOMAIN` or the API refuses to boot.

## Logins (seeded, non-production password `ChangeMe!2026`)
`patient@suluhu.co.ke`, `therapist@suluhu.co.ke`, `admin@suluhu.co.ke`, `founder@suluhu.co.ke`.

Therapist/admin logins require an SMS OTP. The mock SMS provider logs it:

```bash
grep -oE "code to sign in is [0-9]{6}" /tmp/dev.log | tail -1
```

Use a normal window for the patient and an incognito window for the therapist so both
sessions coexist.

## Booking + consult-room flow
Patient: Find a therapist → therapist profile → Book a session → duration → date → slot →
"Pay KES … with M-Pesa". The mock STK push self-confirms after ~2s and the page shows
"Your session is confirmed" (appointment `SCHEDULED`, payment `SUCCEEDED`).

Seeded availability is Mon–Fri 09:00–17:00 EAT and the join window opens 15 min before start,
so after booking, time-travel the appointment (test-only, no code change):

```bash
docker exec suluhu-postgres psql -U suluhu -d suluhu \
  -c "update appointments set scheduled_at = (now() at time zone 'utc') + interval '5 minutes';"
```

Important: `appointments.scheduled_at` is a naive timestamp interpreted as UTC by the app.
Using plain `now()` (which is EAT, UTC+3 in this container) puts the appointment 3 hours in the
future and the page stays on "Not started yet" — always use `now() at time zone 'utc'`.

Phases: patient sees the waiting room (`phase: WAITING`, `canJoin: false`, no roomUrl/token)
until the therapist clicks "Start session"; the patient page polls every 4 s only while WAITING.
Once IN_SESSION the patient page does NOT poll, so after the therapist ends the session the
patient must reload to see "This session has ended".

## Reading room URLs / tokens as evidence
Open DevTools → Network, filter `session`, click the `GET /api/v1/sessions/:id` or
`POST /api/v1/sessions/:id/start` request → Preview. `roomUrl` is plain text; the token is
truncated. To decode a token without using the JS console: right-click the token in Preview →
"Copy string contents", paste it into any text input in the app (e.g. the therapist-directory
search box) and read the value from the page DOM, then decode in the shell:

```bash
echo '<base64url payload after "mockvt.">' | base64 -d
# {"r":"<room>","u":"<user id>","o":<isOwner>,"exp":<unix>}
```

There is no `xclip`/`xsel` on the box, so the clipboard cannot be read from the shell directly.

Cross-check the persisted room name:

```bash
docker exec suluhu-postgres psql -U suluhu -d suluhu -c "select status, video_room_name from appointments;"
```

Reset state between runs: `delete from payments; delete from appointments;`

## Devin Secrets Needed
None for mock mode. Live video testing would need `DAILY_API_KEY` and `DAILY_DOMAIN`.
