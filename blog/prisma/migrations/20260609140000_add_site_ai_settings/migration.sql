-- CreateEnum
CREATE TYPE "AiProvider" AS ENUM ('gemini', 'groq', 'ollama');

-- CreateTable
CREATE TABLE "SiteAiSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "provider" "AiProvider" NOT NULL DEFAULT 'gemini',
    "geminiApiKey" TEXT,
    "groqApiKey" TEXT,
    "geminiModel" TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
    "groqModel" TEXT NOT NULL DEFAULT 'llama-3.3-70b-versatile',
    "ollamaBaseUrl" TEXT NOT NULL DEFAULT 'http://localhost:11434',
    "ollamaModel" TEXT NOT NULL DEFAULT 'llama3.2',
    "autoTranslateOnSave" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "SiteAiSettings_pkey" PRIMARY KEY ("id")
);
