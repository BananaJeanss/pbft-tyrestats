-- AlterTable
ALTER TABLE "shared_sessions" ADD COLUMN     "whoCreated" VARCHAR(255) NOT NULL DEFAULT 'anon';
