import { describe, expect, it } from 'vitest';
import { canSubmitAiSettings } from './ai-settings';

describe('canSubmitAiSettings', () => {
  const base = {
    enabled: false,
    provider: 'gemini' as const,
    geminiModel: 'gemini-2.0-flash',
    groqModel: 'llama-3.3-70b-versatile',
    ollamaBaseUrl: 'http://localhost:11434',
    ollamaModel: 'llama3.2',
    autoTranslateOnSave: true,
  };

  it('allows save when AI is disabled without API keys', () => {
    expect(canSubmitAiSettings(base, null)).toBe(true);
  });

  it('requires gemini key when enabled with gemini provider', () => {
    expect(
      canSubmitAiSettings(
        { ...base, enabled: true, provider: 'gemini' },
        { hasGeminiKey: false, hasGroqKey: false },
      ),
    ).toBe(false);

    expect(
      canSubmitAiSettings(
        { ...base, enabled: true, provider: 'gemini', geminiApiKey: 'secret' },
        { hasGeminiKey: false, hasGroqKey: false },
      ),
    ).toBe(true);

    expect(
      canSubmitAiSettings(
        { ...base, enabled: true, provider: 'gemini' },
        { hasGeminiKey: true, hasGroqKey: false },
      ),
    ).toBe(true);
  });

  it('requires ollama fields when enabled with ollama provider', () => {
    expect(
      canSubmitAiSettings(
        {
          ...base,
          enabled: true,
          provider: 'ollama',
          ollamaBaseUrl: '',
          ollamaModel: '',
        },
        null,
      ),
    ).toBe(false);
  });
});
