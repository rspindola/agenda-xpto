-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'OWNER_NOTIFICATION_FAIL';

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN "reminder_24h_job_id" TEXT,
ADD COLUMN "reminder_2h_job_id" TEXT;
