-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('MINIMAL', 'MILD', 'MODERATE', 'MODERATELY_SEVERE', 'SEVERE');

-- CreateEnum
CREATE TYPE "ClinicalAlertType" AS ENUM ('CRISIS', 'HIGH_RISK', 'SAFEGUARDING');

-- CreateEnum
CREATE TYPE "ClinicalAlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');

-- CreateTable
CREATE TABLE "intake_assessments" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "phq9_score" INTEGER NOT NULL,
    "gad7_score" INTEGER NOT NULL,
    "cage_score" INTEGER NOT NULL,
    "risk_level" "RiskLevel" NOT NULL,
    "crisis_flag" BOOLEAN NOT NULL DEFAULT false,
    "primary_concern" TEXT,
    "recommended_specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "answers" JSONB NOT NULL,
    "ai_summary" TEXT,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intake_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_alerts" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "type" "ClinicalAlertType" NOT NULL,
    "status" "ClinicalAlertStatus" NOT NULL DEFAULT 'OPEN',
    "message" TEXT NOT NULL,
    "source_type" TEXT,
    "source_id" UUID,
    "acknowledged_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "resolved_by_id" UUID,
    "resolution_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinical_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "intake_assessments_patient_id_idx" ON "intake_assessments"("patient_id");

-- CreateIndex
CREATE INDEX "clinical_alerts_status_idx" ON "clinical_alerts"("status");

-- CreateIndex
CREATE INDEX "clinical_alerts_patient_id_idx" ON "clinical_alerts"("patient_id");

-- AddForeignKey
ALTER TABLE "intake_assessments" ADD CONSTRAINT "intake_assessments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_alerts" ADD CONSTRAINT "clinical_alerts_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
