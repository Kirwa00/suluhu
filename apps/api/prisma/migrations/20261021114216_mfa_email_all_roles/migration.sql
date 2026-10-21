-- AlterTable
ALTER TABLE "users" ALTER COLUMN "mfa_enabled" SET DEFAULT true;

-- Backfill: MFA (email OTP on login) is now mandatory for every role, not just
-- therapists/admins. Existing accounts (patients especially) had mfa_enabled=false.
UPDATE "users" SET "mfa_enabled" = true WHERE "mfa_enabled" = false;
