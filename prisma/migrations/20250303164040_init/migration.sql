-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "public";

-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('STARTING', 'ONLINE', 'STOPPED', 'ERROR');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('SYNCING', 'SYNCED', 'ERROR');

-- CreateEnum
CREATE TYPE "model_provider" AS ENUM ('OLLAMA', 'OPENAI');

-- CreateEnum
CREATE TYPE "web_search_provider" AS ENUM ('SERPER');

-- CreateEnum
CREATE TYPE "cache_provider" AS ENUM ('REDIS');

-- CreateEnum
CREATE TYPE "chat_role" AS ENUM ('user', 'assistant', 'system', 'function');

-- CreateTable
CREATE TABLE "agent" (
    "id" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,
    "status" "AgentStatus" NOT NULL DEFAULT 'STARTING',
    "last_heart_beat_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'SYNCING',
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
    "description" TEXT,
    "embedding" vector,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "code_embedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "guy_name" TEXT NOT NULL DEFAULT 'Codebase Guy',
    "embedding_service_url" TEXT NOT NULL DEFAULT 'http://localhost:5050',
    "model_provider" "model_provider" NOT NULL DEFAULT 'OLLAMA',
    "ollama_url" TEXT NOT NULL DEFAULT 'http://localhost:11434',
    "open_api_compatible_api_url" TEXT,
    "model_api_key" TEXT,
    "weak_model" TEXT NOT NULL DEFAULT 'llama3.2:3b',
    "strong_model" TEXT NOT NULL DEFAULT 'llama3:latest',
    "reasoning_model" TEXT NOT NULL DEFAULT 'llama3:latest',
    "cache_enabled" BOOLEAN NOT NULL DEFAULT false,
    "cache_provider" "cache_provider" NOT NULL DEFAULT 'REDIS',
    "redis_host" TEXT,
    "redis_port" TEXT,
    "web_search_enabled" BOOLEAN NOT NULL DEFAULT false,
    "web_search_provider" "web_search_provider" NOT NULL DEFAULT 'SERPER',
    "serper_url" TEXT,
    "serper_api_key" TEXT,
    "allow_agentic_mode" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_message" (
    "id" TEXT NOT NULL,
    "role" "chat_role" NOT NULL,
    "content" TEXT NOT NULL,
    "related_projects" JSONB,
    "prompt" TEXT,
    "chain_of_thought" TEXT,
    "web_search" TEXT,
    "references" JSONB,
    "reference_chat_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "chat_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "settings_guy_name_key" ON "settings"("guy_name");

-- AddForeignKey
ALTER TABLE
    "chat_message"
ADD
    CONSTRAINT "chat_message_reference_chat_id_fkey" FOREIGN KEY ("reference_chat_id") REFERENCES "chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;