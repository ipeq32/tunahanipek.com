'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2, Sparkles } from 'lucide-react';
import AiSetupGuideModal from './AiSetupGuideModal';
import { ContentCard } from '@/components/layout/content-card';
import { Button } from '@/components/ui/button';
import { CharacterCount } from '@/components/ui/character-count';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FIELD_LIMITS } from '@/lib/form/field-limits';
import { canSubmitAiSettings } from '@/lib/validations/ai-settings';

type AiProvider = 'gemini' | 'groq' | 'ollama';

type AiSettingsData = {
  enabled: boolean;
  provider: AiProvider;
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

type FormState = {
  enabled: boolean;
  provider: AiProvider;
  geminiApiKey: string;
  groqApiKey: string;
  geminiModel: string;
  groqModel: string;
  ollamaBaseUrl: string;
  ollamaModel: string;
  autoTranslateOnSave: boolean;
};

const DEFAULT_FORM: FormState = {
  enabled: false,
  provider: 'gemini',
  geminiApiKey: '',
  groqApiKey: '',
  geminiModel: 'gemini-2.0-flash',
  groqModel: 'llama-3.3-70b-versatile',
  ollamaBaseUrl: 'http://localhost:11434',
  ollamaModel: 'llama3.2',
  autoTranslateOnSave: true,
};

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-300">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold leading-tight tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function mapToForm(data: AiSettingsData | null): FormState {
  if (!data) return DEFAULT_FORM;
  return {
    enabled: data.enabled,
    provider: data.provider,
    geminiApiKey: '',
    groqApiKey: '',
    geminiModel: data.geminiModel,
    groqModel: data.groqModel,
    ollamaBaseUrl: data.ollamaBaseUrl,
    ollamaModel: data.ollamaModel,
    autoTranslateOnSave: data.autoTranslateOnSave,
  };
}

function hasAiSettingsChanges(
  form: FormState,
  saved: AiSettingsData | null,
): boolean {
  if (!saved) {
    return true;
  }

  const baseline = mapToForm(saved);

  return (
    form.enabled !== baseline.enabled ||
    form.provider !== baseline.provider ||
    form.geminiModel !== baseline.geminiModel ||
    form.groqModel !== baseline.groqModel ||
    form.ollamaBaseUrl !== baseline.ollamaBaseUrl ||
    form.ollamaModel !== baseline.ollamaModel ||
    form.autoTranslateOnSave !== baseline.autoTranslateOnSave ||
    Boolean(form.geminiApiKey.trim()) ||
    Boolean(form.groqApiKey.trim())
  );
}

export default function AiSettingsSection() {
  const t = useTranslations('Settings.Ai');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saved, setSaved] = useState<AiSettingsData | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ai-settings');
      if (!res.ok) throw new Error('load failed');
      const json = (await res.json()) as { data: AiSettingsData | null };
      setSaved(json.data);
      setForm(mapToForm(json.data));
    } catch {
      toast.error(t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const payload = () => ({
    enabled: form.enabled,
    provider: form.provider,
    geminiApiKey: form.geminiApiKey || undefined,
    groqApiKey: form.groqApiKey || undefined,
    geminiModel: form.geminiModel,
    groqModel: form.groqModel,
    ollamaBaseUrl: form.ollamaBaseUrl,
    ollamaModel: form.ollamaModel,
    autoTranslateOnSave: form.autoTranslateOnSave,
  });

  const canSave = useMemo(
    () =>
      canSubmitAiSettings(payload(), saved),
    [
      form.autoTranslateOnSave,
      form.enabled,
      form.geminiApiKey,
      form.geminiModel,
      form.groqApiKey,
      form.groqModel,
      form.ollamaBaseUrl,
      form.ollamaModel,
      form.provider,
      saved,
    ],
  );

  const hasChanges = useMemo(
    () => hasAiSettingsChanges(form, saved),
    [form, saved],
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/ai-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload()),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? 'save failed');
      }
      const json = (await res.json()) as { data: AiSettingsData };
      setSaved(json.data);
      setForm({
        ...mapToForm(json.data),
        geminiApiKey: '',
        groqApiKey: '',
      });
      toast.success(t('saved'));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('saveError'),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/admin/ai-settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload()),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? 'test failed');
      }
      toast.success(t('testSuccess'));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('testError'),
      );
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <ContentCard className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
      </ContentCard>
    );
  }

  return (
    <ContentCard>
      <SectionHeader
        title={t('title')}
        description={t('description')}
        action={<AiSetupGuideModal activeProvider={form.provider} />}
      />

      {saved?.updatedAt && (
        <p className="-mt-2 mb-4 text-xs text-muted-foreground">
          {t('lastUpdated', {
            date: new Date(saved.updatedAt).toLocaleString(),
          })}
        </p>
      )}

      <div className="space-y-5">
        <label className="flex w-fit items-center gap-2 rounded-lg border border-border/40 bg-background/40 px-3 py-2.5 text-sm">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, enabled: e.target.checked }))
            }
            className="h-4 w-4 rounded border-border accent-violet-600"
          />
          {t('enabled')}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              {t('provider')}
            </label>
            <Select
              value={form.provider}
              onValueChange={(value: AiProvider) =>
                setForm((prev) => ({ ...prev, provider: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini">{t('providers.gemini')}</SelectItem>
                <SelectItem value="groq">{t('providers.groq')}</SelectItem>
                <SelectItem value="ollama">{t('providers.ollama')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              {t('autoTranslateOnSave')}
            </label>
            <label className="flex h-10 items-center gap-2 rounded-md border border-border/60 px-3 text-sm">
              <input
                type="checkbox"
                checked={form.autoTranslateOnSave}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    autoTranslateOnSave: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-border accent-violet-600"
              />
              {t('autoTranslateOnSaveHint')}
            </label>
          </div>
        </div>

        {form.provider === 'gemini' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">
                {t('geminiApiKey')}
              </label>
              <PasswordInput
                value={form.geminiApiKey}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    geminiApiKey: e.target.value,
                  }))
                }
                placeholder={
                  saved?.hasGeminiKey
                    ? (saved.geminiKeyHint ?? t('keyPlaceholderSaved'))
                    : t('keyPlaceholder')
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                {t('geminiModel')}
              </label>
              <Input
                value={form.geminiModel}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, geminiModel: e.target.value }))
                }
              />
              <div className="flex justify-end">
                <CharacterCount
                  value={form.geminiModel}
                  min={FIELD_LIMITS.aiModel.min}
                  max={FIELD_LIMITS.aiModel.max}
                />
              </div>
            </div>
          </div>
        )}

        {form.provider === 'groq' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">
                {t('groqApiKey')}
              </label>
              <PasswordInput
                value={form.groqApiKey}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, groqApiKey: e.target.value }))
                }
                placeholder={
                  saved?.hasGroqKey
                    ? (saved.groqKeyHint ?? t('keyPlaceholderSaved'))
                    : t('keyPlaceholder')
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                {t('groqModel')}
              </label>
              <Input
                value={form.groqModel}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, groqModel: e.target.value }))
                }
              />
              <div className="flex justify-end">
                <CharacterCount
                  value={form.groqModel}
                  min={FIELD_LIMITS.aiModel.min}
                  max={FIELD_LIMITS.aiModel.max}
                />
              </div>
            </div>
          </div>
        )}

        {form.provider === 'ollama' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                {t('ollamaBaseUrl')}
              </label>
              <Input
                value={form.ollamaBaseUrl}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    ollamaBaseUrl: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                {t('ollamaModel')}
              </label>
              <Input
                value={form.ollamaModel}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, ollamaModel: e.target.value }))
                }
              />
              <div className="flex justify-end">
                <CharacterCount
                  value={form.ollamaModel}
                  min={FIELD_LIMITS.aiModel.min}
                  max={FIELD_LIMITS.aiModel.max}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3 border-t border-border/40 pt-4">
        <Button
          type="button"
          variant="accent"
          disabled={saving || testing || !canSave || !hasChanges}
          onClick={() => void handleSave()}
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? t('saving') : t('save')}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={saving || testing || !canSave}
          onClick={() => void handleTest()}
        >
          {testing && <Loader2 className="h-4 w-4 animate-spin" />}
          {testing ? t('testing') : t('testConnection')}
        </Button>
      </div>
    </ContentCard>
  );
}
