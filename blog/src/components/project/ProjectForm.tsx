'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import ImageUpload from '@/components/upload/ImageUpload';
import { useUploadCleanup } from '@/components/upload/use-upload-cleanup';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/navigation';
import { ContentCard } from '@/components/layout/content-card';
import RichTextEditor from '@/components/blog/RichTextEditor';
import TranslationTabs from '@/components/i18n/TranslationTabs';
import { useActiveLanguages } from '@/hooks/use-active-languages';
import {
  buildEmptyProjectTranslations,
  projectTranslationsFromDto,
} from '@/lib/translation-form';
import {
  filterProjectTranslationsForSubmit,
  isProjectTranslationFilled,
} from '@/lib/translation-form-utils';
import AiContentActions from '@/components/content/AiContentActions';

const translationSchema = z.object({
  title: z.string().default(''),
  description: z.string().default(''),
  published: z.boolean().default(false),
});

const formSchema = z
  .object({
    url: z.string().url().optional().or(z.literal('')),
    image: z.string().url().optional().or(z.literal('')),
    translations: z.record(z.string(), translationSchema),
  })
  .superRefine((data, ctx) => {
    const hasFilled = Object.values(data.translations).some((item) =>
      isProjectTranslationFilled(item),
    );
    if (!hasFilled) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one language must be complete',
        path: ['translations'],
      });
    }
  });

export type ProjectFormValues = z.infer<typeof formSchema>;

type ProjectFormProps = {
  mode: 'create' | 'edit';
  projectId?: string;
  defaultValues: {
    url: string;
    image: string;
    translations?: Array<{
      languageCode: string;
      title: string;
      description: string;
      published: boolean;
    }>;
  };
};

export default function ProjectForm({
  mode,
  projectId,
  defaultValues,
}: ProjectFormProps) {
  const router = useRouter();
  const uiLocale = useLocale();
  const t = useTranslations('Admin.Project');
  const imageCleanup = useUploadCleanup();
  const { languages, loading: languagesLoading } = useActiveLanguages();
  const [activeLanguage, setActiveLanguage] = useState(uiLocale);

  const initialTranslations = useMemo(
    () =>
      defaultValues.translations
        ? projectTranslationsFromDto(languages, defaultValues.translations)
        : buildEmptyProjectTranslations(languages),
    [defaultValues.translations, languages],
  );

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: defaultValues.url,
      image: defaultValues.image,
      translations: initialTranslations,
    },
  });

  useEffect(() => {
    if (!languagesLoading && languages.length > 0) {
      form.reset({
        url: defaultValues.url,
        image: defaultValues.image,
        translations: defaultValues.translations
          ? projectTranslationsFromDto(languages, defaultValues.translations)
          : buildEmptyProjectTranslations(languages),
      });
    }
  }, [defaultValues, form, languages, languagesLoading]);

  useEffect(() => {
    if (languages.some((l) => l.code === uiLocale)) {
      setActiveLanguage(uiLocale);
    }
  }, [languages, uiLocale]);

  async function onSubmit(values: ProjectFormValues) {
    const url =
      mode === 'create' ? `/api/projects/admin` : `/api/projects/${projectId}`;

    const translations = filterProjectTranslationsForSubmit(
      Object.entries(values.translations).map(([languageCode, fields]) => ({
        languageCode,
        title: fields.title.trim(),
        description: fields.description,
        published: fields.published,
      })),
    );

    if (translations.length === 0) {
      toast.error(t('actionError'), { description: t('atLeastOneLanguage') });
      return;
    }

    const payload = {
      url: values.url?.trim() || '',
      image: values.image?.trim() || '',
      translations,
    };

    try {
      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-locale': uiLocale,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        toast.error(t('actionError'));
        return;
      }

      imageCleanup.commit();
      toast.success(mode === 'create' ? t('created') : t('updated'));
      router.push('/admin/project');
    } catch {
      toast.error(t('actionError'));
    }
  }

  return (
    <ContentCard className="mt-2">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col gap-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('languagesSection')}
            </p>
            <TranslationTabs
              languages={languages}
              activeCode={activeLanguage}
              onChange={setActiveLanguage}
            />
          </div>

          {languages.map((language) => {
            const hidden = language.code !== activeLanguage;

            return (
              <div
                key={language.id}
                className={hidden ? 'hidden' : 'space-y-5'}
                aria-hidden={hidden}
              >
                <AiContentActions
                  contentType="project"
                  activeLanguage={language.code}
                  languages={languages}
                  activeFields={form.watch(`translations.${language.code}`)}
                  allTranslations={form.watch('translations')}
                  disabled={form.formState.isSubmitting}
                  onApply={(fields) => {
                    if (fields.title) {
                      form.setValue(
                        `translations.${language.code}.title`,
                        fields.title,
                      );
                    }
                    if (fields.description) {
                      form.setValue(
                        `translations.${language.code}.description`,
                        fields.description,
                      );
                    }
                  }}
                />

                <FormField
                  control={form.control}
                  name={`translations.${language.code}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        {t('fieldTitle')} ({language.name}){' '}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`translations.${language.code}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        {t('fieldDescription')}{' '}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <RichTextEditor
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Controller
                  control={form.control}
                  name={`translations.${language.code}.published`}
                  render={({ field }) => (
                    <label className="flex w-fit items-center gap-2 rounded-lg border border-border/40 bg-background/40 px-3 py-2.5 text-sm">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4 rounded border-border accent-teal-600"
                      />
                      {t('fieldPublished')} ({language.name})
                    </label>
                  )}
                />
              </div>
            );
          })}

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">{t('fieldImage')}</FormLabel>
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  disabled={form.formState.isSubmitting}
                  endpoint="projectImageUploader"
                  cleanup={imageCleanup}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">{t('fieldUrl')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('urlPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-wrap gap-2 border-t border-border/40 pt-4">
            <Button
              type="submit"
              variant="accent"
              disabled={form.formState.isSubmitting || languagesLoading}
            >
              {mode === 'create' ? t('add') : t('save')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/project')}
            >
              {t('cancel')}
            </Button>
          </div>
        </form>
      </Form>
    </ContentCard>
  );
}
