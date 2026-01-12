-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "shared_sessions" (
    "short_url" VARCHAR(10) NOT NULL,
    "session_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "hashcheck" VARCHAR(64) NOT NULL,

    CONSTRAINT "shared_sessions_pkey" PRIMARY KEY ("short_url")
);

