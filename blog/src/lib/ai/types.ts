import type { DecryptedAiConfig } from '@/lib/site-ai-settings';

export type AiGenerateOptions = {
  temperature?: number;
  maxOutputTokens?: number;
};

export interface AiProviderClient {
  generateText(prompt: string, options?: AiGenerateOptions): Promise<string>;
}

export type { DecryptedAiConfig };

export type BlogContentFields = {
  title?: string;
  content?: string;
  summary?: string;
};

export type ProjectContentFields = {
  title?: string;
  description?: string;
};

export type ContentFields = BlogContentFields & ProjectContentFields;

export type TranslateResult = ContentFields;

export class AiNotConfiguredError extends Error {
  constructor(message = 'AI is not configured') {
    super(message);
    this.name = 'AiNotConfiguredError';
  }
}

export class AiGenerationError extends Error {
  constructor(message = 'AI generation failed') {
    super(message);
    this.name = 'AiGenerationError';
  }
}
