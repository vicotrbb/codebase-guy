-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "public";

-- CreateTable
CREATE TABLE "agent" (
    "id" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'STARTING',
    "last_heart_beat_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SYNCING',
    "sync_state" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_embedding" (
    "id" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "absolute_path" TEXT NOT NULL,
    "chunk_text" TEXT NOT NULL,
    "chunk_start" INTEGER NOT NULL,
    "chunk_end" INTEGER NOT NULL,
    "chunk_start_line" INTEGER NOT NULL,
    "chunk_end_line" INTEGER NOT NULL,
    "embedding" vector,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "code_embedding_pkey" PRIMARY KEY ("id")
);