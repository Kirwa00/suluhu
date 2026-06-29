-- CreateEnum
CREATE TYPE "ClinicalNoteStatus" AS ENUM ('DRAFT', 'FINALIZED');

-- CreateEnum
CREATE TYPE "TreatmentPlanStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "clinical_notes" (
    "id" UUID NOT NULL,
    "appointment_id" UUID,
    "patient_id" UUID NOT NULL,
    "therapist_id" UUID NOT NULL,
    "note_type" TEXT NOT NULL DEFAULT 'SOAP',
    "subjective_enc" TEXT,
    "objective_enc" TEXT,
    "assessment_enc" TEXT,
    "plan_enc" TEXT,
    "risk_assessment_enc" TEXT,
    "status" "ClinicalNoteStatus" NOT NULL DEFAULT 'DRAFT',
    "finalized_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinical_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treatment_plans" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "therapist_id" UUID NOT NULL,
    "goals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "interventions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "review_date" TIMESTAMP(3),
    "status" "TreatmentPlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "summary_enc" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treatment_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clinical_notes_appointment_id_key" ON "clinical_notes"("appointment_id");

-- CreateIndex
CREATE INDEX "clinical_notes_patient_id_idx" ON "clinical_notes"("patient_id");

-- CreateIndex
CREATE INDEX "clinical_notes_therapist_id_idx" ON "clinical_notes"("therapist_id");

-- CreateIndex
CREATE INDEX "treatment_plans_patient_id_idx" ON "treatment_plans"("patient_id");

-- CreateIndex
CREATE INDEX "treatment_plans_therapist_id_idx" ON "treatment_plans"("therapist_id");

-- AddForeignKey
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_plans" ADD CONSTRAINT "treatment_plans_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_plans" ADD CONSTRAINT "treatment_plans_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
