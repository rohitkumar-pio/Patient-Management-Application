-- Visit history: filter by patient (+ optional date range), ordered by visitDate.
-- The composite index serves the filter and the sort; it also covers patientId-only
-- lookups, so the single-column patientId index is redundant.

-- DropIndex
DROP INDEX "visits_patientId_idx";

-- CreateIndex
CREATE INDEX "visits_patientId_visitDate_idx" ON "visits"("patientId", "visitDate");
