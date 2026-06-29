-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateTable
CREATE TABLE "payouts" (
    "id" UUID NOT NULL,
    "therapist_id" UUID NOT NULL,
    "amount_ksh" INTEGER NOT NULL,
    "sessions_count" INTEGER NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'MPESA_B2C',
    "status" "PayoutStatus" NOT NULL DEFAULT 'PAID',
    "reference" TEXT,
    "period_end" TIMESTAMP(3) NOT NULL,
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payouts_therapist_id_idx" ON "payouts"("therapist_id");

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
