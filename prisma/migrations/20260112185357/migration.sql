/*
  Warnings:

  - A unique constraint covering the columns `[hashcheck]` on the table `shared_sessions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "shared_sessions_hashcheck_key" ON "shared_sessions"("hashcheck");
