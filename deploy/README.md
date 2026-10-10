# Deploying Suluhu on a single Docker host

Target layout: one server (e.g. Hetzner CPX31 — 4 vCPU / 8 GB) running the whole
stack under Docker Compose, with Cloudflare fronting DNS for `suluhutherapy.com`.

```
Cloudflare (proxied)
  ├── suluhutherapy.com      →  Caddy :443  →  web :3000   (Next.js)
  └── api.suluhutherapy.com  →  Caddy :443  →  api :4000   (NestJS)
                                 api → postgres:5432, redis:6379 (internal only)
                                 api → /data/therapist-documents (named volume)
```

Postgres, Redis and both apps are only reachable through Caddy; nothing but
80/443 is published.

## 1. Server

```bash
# Ubuntu 24.04, as root
curl -fsSL https://get.docker.com | sh
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable
git clone https://github.com/Kirwa00/suluhu.git /opt/suluhu
```

Harden before going live: key-only SSH (`PasswordAuthentication no`), a non-root
deploy user in the `docker` group, and `unattended-upgrades`.

## 2. Configuration

```bash
cd /opt/suluhu
cp .env.production.example .env.production
chmod 600 .env.production
openssl rand -base64 48   # JWT_ACCESS_SECRET
openssl rand -base64 48   # JWT_REFRESH_SECRET
openssl rand -base64 32   # PHI_ENCRYPTION_KEY — back this up, see below
openssl rand -base64 24   # POSTGRES_PASSWORD / REDIS_PASSWORD
```

Fill every blank in `.env.production`, including the passwords inside
`DATABASE_URL`, `DIRECT_URL` and `REDIS_URL`.

**`PHI_ENCRYPTION_KEY` is not rotatable in place.** Clinical notes are encrypted
with it; losing or changing it makes existing notes permanently unreadable. Store
a copy in a password manager before the first patient record exists.

## 3. DNS (Cloudflare)

| Type | Name  | Content       | Proxy |
| ---- | ----- | ------------- | ----- |
| A    | `@`   | *server IPv4* | on    |
| A    | `api` | *server IPv4* | on    |
| AAAA | `@`   | *server IPv6* | on    |
| AAAA | `api` | *server IPv6* | on    |

Set SSL/TLS mode to **Full (strict)** — Caddy gets a real Let's Encrypt
certificate over HTTP-01, which Cloudflare forwards. "Flexible" would break the
API (redirect loops) and leave the origin hop unencrypted. Leave *Always Use
HTTPS* on.

## 4. First deploy

```bash
cd /opt/suluhu
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm migrate
curl -fsS https://api.suluhutherapy.com/api/v1/health
```

`npm run db:seed` is development demo data (patients, therapists, the
`ChangeMe!2026` logins) — do **not** run it against production. Create the first
admin directly instead.

## 5. Redeploys

```bash
cd /opt/suluhu && git pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm migrate
```

The web image bakes `NEXT_PUBLIC_API_URL` at build time from `API_DOMAIN`, so
changing the API domain requires a rebuild, not just a restart.

## 6. Backups

`deploy/backup-db.sh` writes a gzipped `pg_dump` to `/var/backups/suluhu` and
prunes dumps older than 14 days:

```bash
sudo ln -s /opt/suluhu/deploy/backup-db.sh /etc/cron.daily/suluhu-backup
```

Copy the dumps and the `suluhu_documents` volume off the box (object storage,
e.g. Cloudflare R2) — same-disk dumps do not survive the failure they exist for.
Restore is `gunzip -c dump.sql.gz | docker compose ... exec -T postgres psql -U suluhu -d suluhu`.

## 7. Going live on providers

Each integration is a flag in `.env.production`; flip one at a time and restart
the API. `MPESA_MODE=live` additionally needs the PayHero callback
(`https://api.suluhutherapy.com/api/v1/payments/mpesa/callback`) registered with
PayHero, and `SMS_MODE=live` gates therapist/admin OTP login — until it is live,
those OTPs only appear in the API logs.
