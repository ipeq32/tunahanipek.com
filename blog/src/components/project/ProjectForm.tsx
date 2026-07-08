'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormFieldFooter,
  FormItem,
  FormLabel,
  FormMessage,
  FormRequiredIndicator,
} from '@/components/ui/form';
import { CharacterCount } from '@/components/ui/character-count';
import { FIELD_LIMITS, LIVE_FORM_OPTIONS } from '@/lib/form/field-limits';
import {
  useZodFormSubmitDisabled,
} from '@/lib/form/submit-state';
import { useFormBaseline } from '@/lib/form/form-baseline';
import { stripHtmlText } from '@/lib/translation-form-utils';
import { Input } from '@/components/ui/input';
import ImageUpload from '@/components/upload/ImageUpload';
import GalleryUpload from '@/components/upload/GalleryUpload';
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
  deriveProjectPublished,
  projectTranslationsFromDto,
} from '@/lib/translation-form';
import {
  filterProjectTranslationsForSubmit,
  isProjectTranslationFilled,
} from '@/lib/translation-form-utils';
import AiContentActions from '@/components/content/AiContentActions';
import ProjectScreenshotCapture from '@/components/project/ProjectScreenshotCapture';
import ProjectSiteAuthFields from '@/components/project/ProjectSiteAuthFields';
import { normalizeExternalUrl } from '@/lib/validations/url-field';
import type { SiteAuthCredentials } from '@/lib/validations/site-auth';

function createProjectFormSchema(
  t: (key: string, values?: Record<string, string | number>) => string,
) {
  const optionalProjectUrl = z.union([
    z.literal(''),
    z.string().trim().url({ message: t('validation.urlInvalid') }),
  ]);

  const translationSchema = z.object({
    title: z
      .string()
      .default('')
      .refine(
        (value) =>
          !value.trim() || value.trim().length >= FIELD_LIMITS.project.title.min,
        {
          message: t('validation.titleTooShort', {
            min: FIELD_LIMITS.project.title.min,
          }),
        }
      )
      .refine(
        (value) => value.trim().length <= FIELD_LIMITS.project.title.max,
        {
          message: t('validation.titleTooLong', {
            max: FIELD_LIMITS.project.title.max,
          }),
        }
      ),
    description: z
      .string()
      .default('')
      .refine(
        (value) =>
          !stripHtmlText(value) ||
          stripHtmlText(value).length >= FIELD_LIMITS.project.description.min,
        {
          message: t('validation.descriptionTooShort', {
            min: FIELD_LIMITS.project.description.min,
          }),
        }
      )
      .refine(
        (value) =>
          stripHtmlText(value).length <= FIELD_LIMITS.project.description.max,
        {
          message: t('validation.descriptionTooLong', {
            max: FIELD_LIMITS.project.description.max,
          }),
        }
      ),
  });

  return z
    .object({
      url: optionalProjectUrl,
      image: optionalProjectUrl,
      gallery: z.array(z.string().url({ message: t('validation.urlInvalid') })).max(12),
      published: z.boolean().default(false),
      translations: z.record(z.string(), translationSchema),
    })
    .superRefine((data, ctx) => {
      const hasFilled = Object.values(data.translations).some((item) =>
        isProjectTranslationFilled(item)
      );
      if (!hasFilled) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('atLeastOneLanguage'),
          path: ['translations'],
        });
      }
    });
}

export type ProjectFormValues = z.infer<ReturnType<typeof createProjectFormSchema>>;

type ProjectFormProps = {
  mode: 'create' | 'edit';
  projectId?: string;
  canPublish?: boolean;
  defaultValues: {
    url: string;
    image: string;
    gallery?: string[];
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
  canPublish = false,
  defaultValues,
}: ProjectFormProps) {
  const router = useRouter();
  const uiLocale = useLocale();
  const t = useTranslations('Admin.Project');
  const imageCleanup = useUploadCleanup();
  const { languages, loading: languagesLoading } = useActiveLanguages();
  const [activeLanguage, setActiveLanguage] = useState(uiLocale);
  const [siteAuthCredentials, setSiteAuthCredentials] =
    useState<SiteAuthCredentials>({
      username: '',
      password: '',
    });

  const formSchema = useMemo(() => createProjectFormSchema(t), [t]);

  const initialTranslations = useMemo(
    () =>
      defaultValues.translations
        ? projectTranslationsFromDto(languages, defaultValues.translations)
        : buildEmptyProjectTranslations(languages),
    [defaultValues.translations, languages],
  );

  const initialPublished = useMemo(() => {
    if (!defaultValues.translations?.length) {
      return false;
    }

    const byCode = Object.fromEntries(
      defaultValues.translations.map((item) => [
        item.languageCode,
        item,
      ]),
    );

    return deriveProjectPublished(byCode);
  }, [defaultValues.translations]);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: defaultValues.url,
      image: defaultValues.image,
      gallery: defaultValues.gallery ?? [],
      translations: initialTranslations,
      published: initialPublished,
    },
    ...LIVE_FORM_OPTIONS,
  });

  const { baseline, baselineVersion, syncBaselineAfterReset } = useFormBaseline(form);

  useEffect(() => {
    if (!languagesLoading && languages.length > 0) {
      form.reset(
        {
          url: defaultValues.url,
          image: defaultValues.image,
          gallery: defaultValues.gallery ?? [],
          translations: defaultValues.translations
            ? projectTranslationsFromDto(languages, defaultValues.translations)
            : buildEmptyProjectTranslations(languages),
          published: initialPublished,
        },
        { keepDefaultValues: false },
      );

      if (mode === 'edit') {
        syncBaselineAfterReset();
      }
    }
  }, [defaultValues, form, initialPublished, languages, languagesLoading, mode, syncBaselineAfterReset]);

  useEffect(() => {
    if (languages.some((l) => l.code === uiLocale)) {
      setActiveLanguage(uiLocale);
    }
  }, [languages, uiLocale]);

  const submitDisabled = useZodFormSubmitDisabled(form, formSchema, {
    extraDisabled: languagesLoading,
    requireDirty: mode === 'edit',
    baseline: mode === 'edit' ? baseline : null,
    baselineVersion,
  });

  async function onSubmit(values: ProjectFormValues) {
    const url =
      mode === 'create' ? `/api/projects/admin` : `/api/projects/${projectId}`;

    const publish = canPublish ? values.published : false;

    const translations = filterProjectTranslationsForSubmit(
      Object.entries(values.translations).map(([languageCode, fields]) => ({
        languageCode,
        title: fields.title.trim(),
        description: fields.description,
        published: publish,
      })),
    );

    if (translations.length === 0) {
      toast.error(t('actionError'), { description: t('atLeastOneLanguage') });
      return;
    }

    const payload = {
      url: normalizeExternalUrl(values.url),
      image: normalizeExternalUrl(values.image),
      gallery: values.gallery
        .map((item) => normalizeExternalUrl(item))
        .filter((item): item is string => Boolean(item)),
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

          {(() => {
            const language = languages.find((item) => item.code === activeLanguage);
            if (!language) {
              return null;
            }

            return (
              <div key={language.id} className="space-y-5">
                <AiContentActions
                  contentType="project"
                  activeLanguage={language.code}
                  languages={languages}
                  activeFields={form.watch(`translations.${language.code}`)}
                  allTranslations={form.watch('translations')}
                  projectUrl={form.watch('url')}
                  siteAuthCredentials={siteAuthCredentials}
                  onSiteAuthCredentialsChange={setSiteAuthCredentials}
                  disabled={form.formState.isSubmitting}
                  onApply={(fields) => {
                    if (fields.title) {
                      form.setValue(
                        `translations.${language.code}.title`,
                        fields.title,
                        { shouldValidate: true, shouldDirty: true },
                      );
                    }
                    if (fields.description) {
                      form.setValue(
                        `translations.${language.code}.description`,
                        fields.description,
                        { shouldValidate: true, shouldDirty: true },
                      );
                    }
                  }}
                />

                <FormField
                  control={form.control}
                  name={`translations.${language.code}.title`}
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        {t('fieldTitle')} ({language.name})
                        <FormRequiredIndicator />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormFieldFooter>
                        <FormMessage />
                        <CharacterCount
                          value={field.value}
                          min={FIELD_LIMITS.project.title.min}
                          max={FIELD_LIMITS.project.title.max}
                          showMinWarning={fieldState.isDirty || fieldState.isTouched}
                        />
                      </FormFieldFooter>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`translations.${language.code}.description`}
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        {t('fieldDescription')}
                        <FormRequiredIndicator />
                      </FormLabel>
                      <FormControl>
                        <RichTextEditor
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormFieldFooter>
                        <FormMessage />
                        <CharacterCount
                          value={stripHtmlText(field.value)}
                          min={FIELD_LIMITS.project.description.min}
                          max={FIELD_LIMITS.project.description.max}
                          showMinWarning={fieldState.isDirty || fieldState.isTouched}
                        />
                      </FormFieldFooter>
                    </FormItem>
                  )}
                />
              </div>
            );
          })()}

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

          {Boolean(form.watch('url')?.trim()) && (
            <ProjectSiteAuthFields
              value={siteAuthCredentials}
              onChange={setSiteAuthCredentials}
              disabled={form.formState.isSubmitting}
            />
          )}

          <ProjectScreenshotCapture
            projectUrl={form.watch('url')}
            siteAuthCredentials={siteAuthCredentials}
            onSiteAuthCredentialsChange={setSiteAuthCredentials}
            hasExistingMedia={Boolean(form.watch('image') || form.watch('gallery').length > 0)}
            disabled={form.formState.isSubmitting}
            cleanup={imageCleanup}
                  onApply={({ image, gallery }) => {
              form.setValue('image', image, {
                shouldValidate: true,
                shouldDirty: true,
              });
              form.setValue('gallery', gallery, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
          />

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">{t('fieldCoverImage')}</FormLabel>
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
            name="gallery"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">{t('fieldGallery')}</FormLabel>
                <GalleryUpload
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

          <div className="flex flex-col gap-4 border-t border-border/40 pt-4 sm:flex-row sm:items-center sm:justify-between">
            {canPublish ? (
              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <label className="flex w-fit items-center gap-2 rounded-lg border border-border/40 bg-background/40 px-3 py-2.5 text-sm">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(event) => field.onChange(event.target.checked)}
                          className="h-4 w-4 rounded border-border accent-teal-600"
                        />
                      </FormControl>
                      {t('fieldPublished')}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {t('fieldPublishedHint')}
                    </p>
                  </FormItem>
                )}
              />
            ) : (
              <span />
            )}

            <div className="flex flex-wrap gap-2 sm:justify-end">
            <Button
              type="submit"
              variant="accent"
              disabled={submitDisabled}
            >
              {mode === 'create' ? t('add') : t('save')}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={form.formState.isSubmitting}
              onClick={() => router.push('/admin/project')}
            >
              {t('cancel')}
            </Button>
            </div>
          </div>
        </form>
      </Form>
    </ContentCard>
  );
}
