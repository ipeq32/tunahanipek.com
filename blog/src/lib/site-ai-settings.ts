import 'server-only';

import type { AiProvider } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  decryptSecret,
  encryptSecret,
  maskSecret,
} from '@/lib/secret-crypto';

export const SITE_AI_SETTINGS_ID = 'default';

export type AiProviderType = AiProvider;

export type SiteAiSettingsDto = {
  enabled: boolean;
  provider: AiProviderType;
  geminiModel: string;
  groqModel: string;
  ollamaBaseUrl: string;
  ollamaModel: string;
  autoTranslateOnSave: boolean;
  hasGeminiKey: boolean;
  hasGroqKey: boolean;
  geminiKeyHint: string | null;
  groqKeyHint: string | null;
  updatedAt: string | null;
};

export type DecryptedAiConfig = {
  enabled: boolean;
  provider: AiProviderType;
  geminiApiKey: string | null;
  groqApiKey: string | null;
  geminiModel: string;
  groqModel: string;
  ollamaBaseUrl: string;
  ollamaModel: string;
  autoTranslateOnSave: boolean;
};

export type UpsertSiteAiSettingsInput = {
  enabled: boolean;
  provider: AiProviderType;
  geminiApiKey?: string;
  groqApiKey?: string;
  geminiModel: string;
  groqModel: string;
  ollamaBaseUrl: string;
  ollamaModel: string;
  autoTranslateOnSave: boolean;
};

function mapRowToDto(row: {
  enabled: boolean;
  provider: AiProviderType;
  geminiApiKey: string | null;
  groqApiKey: string | null;
  geminiModel: string;
  groqModel: string;
  ollamaBaseUrl: string;
  ollamaModel: string;
  autoTranslateOnSave: boolean;
  updatedAt: Date;
}): SiteAiSettingsDto {
  return {
    enabled: row.enabled,
    provider: row.provider,
    geminiModel: row.geminiModel,
    groqModel: row.groqModel,
    ollamaBaseUrl: row.ollamaBaseUrl,
    ollamaModel: row.ollamaModel,
    autoTranslateOnSave: row.autoTranslateOnSave,
    hasGeminiKey: Boolean(row.geminiApiKey),
    hasGroqKey: Boolean(row.groqApiKey),
    geminiKeyHint: row.geminiApiKey
      ? maskSecret(decryptSecret(row.geminiApiKey))
      : null,
    groqKeyHint: row.groqApiKey
      ? maskSecret(decryptSecret(row.groqApiKey))
      : null,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getSiteAiSettings(): Promise<SiteAiSettingsDto | null> {
  const row = await prisma.siteAiSettings.findUnique({
    where: { id: SITE_AI_SETTINGS_ID },
  });

  if (!row) {
    return null;
  }

  return mapRowToDto(row);
}

export async function getDecryptedAiConfig(): Promise<DecryptedAiConfig | null> {
  const row = await prisma.siteAiSettings.findUnique({
    where: { id: SITE_AI_SETTINGS_ID },
  });

  if (!row) {
    return null;
  }

  return {
    enabled: row.enabled,
    provider: row.provider,
    geminiApiKey: row.geminiApiKey
      ? decryptSecret(row.geminiApiKey)
      : null,
    groqApiKey: row.groqApiKey ? decryptSecret(row.groqApiKey) : null,
    geminiModel: row.geminiModel,
    groqModel: row.groqModel,
    ollamaBaseUrl: row.ollamaBaseUrl,
    ollamaModel: row.ollamaModel,
    autoTranslateOnSave: row.autoTranslateOnSave,
  };
}

export function isAiConfigured(config: DecryptedAiConfig): boolean {
  if (!config.enabled) {
    return false;
  }

  switch (config.provider) {
    case 'groq':
      return Boolean(config.groqApiKey?.trim());
    case 'ollama':
      return Boolean(config.ollamaBaseUrl?.trim() && config.ollamaModel?.trim());
    default:
      return Boolean(config.geminiApiKey?.trim());
  }
}

export async function upsertSiteAiSettings(
  input: UpsertSiteAiSettingsInput,
): Promise<SiteAiSettingsDto> {
  const existing = await prisma.siteAiSettings.findUnique({
    where: { id: SITE_AI_SETTINGS_ID },
  });

  const geminiApiKey =
    input.geminiApiKey?.trim()
      ? encryptSecret(input.geminiApiKey.trim())
      : (existing?.geminiApiKey ?? null);

  const groqApiKey =
    input.groqApiKey?.trim()
      ? encryptSecret(input.groqApiKey.trim())
      : (existing?.groqApiKey ?? null);

  const row = await prisma.siteAiSettings.upsert({
    where: { id: SITE_AI_SETTINGS_ID },
    create: {
      id: SITE_AI_SETTINGS_ID,
      enabled: input.enabled,
      provider: input.provider,
      geminiApiKey,
      groqApiKey,
      geminiModel: input.geminiModel,
      groqModel: input.groqModel,
      ollamaBaseUrl: input.ollamaBaseUrl,
      ollamaModel: input.ollamaModel,
      autoTranslateOnSave: input.autoTranslateOnSave,
    },
    update: {
      enabled: input.enabled,
      provider: input.provider,
      geminiApiKey,
      groqApiKey,
      geminiModel: input.geminiModel,
      groqModel: input.groqModel,
      ollamaBaseUrl: input.ollamaBaseUrl,
      ollamaModel: input.ollamaModel,
      autoTranslateOnSave: input.autoTranslateOnSave,
    },
  });

  return mapRowToDto(row);
}
