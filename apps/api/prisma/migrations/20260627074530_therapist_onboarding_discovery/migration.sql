-- CreateEnum
CREATE TYPE "CredentialDocumentType" AS ENUM ('CPB_LICENSE', 'NATIONAL_ID', 'CERTIFICATE', 'CV', 'OTHER');

-- AlterTable
ALTER TABLE "therapist_profiles" ADD COLUMN     "cpb_check_result" JSONB,
ADD COLUMN     "cpb_verified_at" TIMESTAMP(3),
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "profile_photo_url" TEXT,
ADD COLUMN     "rating_avg" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "rating_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rejection_reason" TEXT,
ADD COLUMN     "reviewed_at" TIMESTAMP(3),
ADD COLUMN     "reviewed_by_id" UUID,
ADD COLUMN     "sessions_completed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "submitted_at" TIMESTAMP(3),
ADD COLUMN     "title" TEXT,
ADD COLUMN     "years_experience" INTEGER;

-- CreateTable
CREATE TABLE "therapist_availability" (
    "id" UUID NOT NULL,
    "therapist_id" UUID NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "therapist_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "therapist_documents" (
    "id" UUID NOT NULL,
    "therapist_id" UUID NOT NULL,
    "type" "CredentialDocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "original_name" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "therapist_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "therapist_availability_therapist_id_idx" ON "therapist_availability"("therapist_id");

-- CreateIndex
CREATE UNIQUE INDEX "therapist_availability_therapist_id_day_of_week_start_time_key" ON "therapist_availability"("therapist_id", "day_of_week", "start_time");

-- CreateIndex
CREATE INDEX "therapist_documents_therapist_id_idx" ON "therapist_documents"("therapist_id");

-- AddForeignKey
ALTER TABLE "therapist_availability" ADD CONSTRAINT "therapist_availability_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "therapist_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "therapist_documents" ADD CONSTRAINT "therapist_documents_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "therapist_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
