'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
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
  DeferredFieldError,
} from '@/components/ui/form';
import { CharacterCount } from '@/components/ui/character-count';
import { FIELD_LIMITS, LIVE_FORM_OPTIONS } from '@/lib/form/field-limits';
import {
  useZodFormSubmitDisabled,
} from '@/lib/form/submit-state';
import { useFormBaseline } from '@/lib/form/form-baseline';
import { stripHtmlText } from '@/lib/translation-form-utils';
import { CardStackPlusIcon } from '@radix-ui/react-icons';
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
  blogTranslationsFromDto,
  buildEmptyBlogTranslations,
} from '@/lib/translation-form';
import {
  filterBlogTranslationsForSubmit,
  isBlogTranslationFilled,
} from '@/lib/translation-form-utils';
import AiContentActions from '@/components/content/AiContentActions';

function createBlogFormSchema(
  t: (key: string, values?: Record<string, string | number>) => string
) {
  const translationSchema = z.object({
    title: z
      .string()
      .default('')
      .refine(
        (value) =>
          !value.trim() || value.trim().length >= FIELD_LIMITS.blog.title.min,
        {
          message: t('validation.titleTooShort', {
            min: FIELD_LIMITS.blog.title.min,
          }),
        }
      )
      .refine(
        (value) => value.trim().length <= FIELD_LIMITS.blog.title.max,
        {
          message: t('validation.titleTooLong', {
            max: FIELD_LIMITS.blog.title.max,
          }),
        }
      ),
    content: z.string().default(''),
    summary: z
      .string()
      .default('')
      .refine(
        (value) =>
          !value.trim() || value.trim().length >= FIELD_LIMITS.blog.summary.min,
        { message: t('validation.summaryRequired') }
      )
      .refine(
        (value) => value.trim().length <= FIELD_LIMITS.blog.summary.max,
        {
          message: t('validation.summaryTooLong', {
            max: FIELD_LIMITS.blog.summary.max,
          }),
        }
      ),
  });

  return z
    .object({
      image: z.string().min(2, t('validation.imageRequired')),
      shortImage: z.string().min(2, t('validation.imageRequired')),
      tags: z
        .string()
        .max(FIELD_LIMITS.blog.taxonomy.max, t('validation.taxonomyTooLong', {
          max: FIELD_LIMITS.blog.taxonomy.max,
        }))
        .optional(),
      categories: z
        .string()
        .max(FIELD_LIMITS.blog.taxonomy.max, t('validation.taxonomyTooLong', {
          max: FIELD_LIMITS.blog.taxonomy.max,
        }))
        .optional(),
      translations: z.record(z.string(), translationSchema),
    })
    .superRefine((data, ctx) => {
      const hasFilled = Object.values(data.translations).some((item) =>
        isBlogTranslationFilled(item)
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

export type BlogFormValues = z.infer<ReturnType<typeof createBlogFormSchema>>;

type BlogFormProps = {
  mode: 'create' | 'edit';
  blogId?: string;
  defaultValues: {
    image: string;
    shortImage: string;
    tags: string;
    categories: string;
    translations?: Array<{
      languageCode: string;
      title: string;
      content: string;
      summary: string;
    }>;
  };
};

async function parseApiError(res: Response): Promise<string | undefined> {
  try {
    const data = (await res.json()) as { error?: string };
    return typeof data.error === 'string' ? data.error : undefined;
  } catch {
    return undefined;
  }
}

export default function BlogForm({ mode, blogId, defaultValues }: BlogFormProps) {
  const router = useRouter();
  const uiLocale = useLocale();
  const t = useTranslations('Blog.Form');
  const imageCleanup = useUploadCleanup();
  const { languages, loading: languagesLoading } = useActiveLanguages();
  const [activeLanguage, setActiveLanguage] = useState(uiLocale);

  const formSchema = useMemo(() => createBlogFormSchema(t), [t]);

  const initialTranslations = useMemo(
    () =>
      defaultValues.translations
        ? blogTranslationsFromDto(languages, defaultValues.translations)
        : buildEmptyBlogTranslations(languages),
    [defaultValues.translations, languages],
  );

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: defaultValues.image,
      shortImage: defaultValues.shortImage,
      tags: defaultValues.tags,
      categories: defaultValues.categories,
      translations: initialTranslations,
    },
    ...LIVE_FORM_OPTIONS,
  });

  const { baseline, baselineVersion, syncBaselineAfterReset } = useFormBaseline(form);

  useEffect(() => {
    if (!languagesLoading && languages.length > 0) {
      form.reset(
        {
          image: defaultValues.image,
          shortImage: defaultValues.shortImage,
          tags: defaultValues.tags,
          categories: defaultValues.categories,
          translations: defaultValues.translations
            ? blogTranslationsFromDto(languages, defaultValues.translations)
            : buildEmptyBlogTranslations(languages),
        },
        { keepDefaultValues: false },
      );

      if (mode === 'edit') {
        syncBaselineAfterReset();
      }
    }
  }, [
    defaultValues,
    form,
    languages,
    languagesLoading,
    mode,
    syncBaselineAfterReset,
  ]);

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

  async function onSubmit(values: BlogFormValues) {
    const url = mode === 'create' ? `/api/blog/add` : `/api/blog/${blogId}`;
    const method = mode === 'create' ? 'POST' : 'PATCH';

    const translations = filterBlogTranslationsForSubmit(
      Object.entries(values.translations).map(([languageCode, fields]) => ({
        languageCode,
        ...fields,
      })),
    );

    if (translations.length === 0) {
      toast.error(t('error'), { description: t('atLeastOneLanguage') });
      return;
    }

    const payload =
      mode === 'create'
        ? {
            image: values.image,
            shortImage: values.shortImage,
            tags: values.tags,
            categories: values.categories,
            translations,
          }
        : {
            image: values.image,
            shortImage: values.shortImage,
            tags: values.tags,
            categories: values.categories,
            translations,
          };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-locale': uiLocale,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const apiError = await parseApiError(res);
        toast.error(t('error'), {
          description: apiError,
        });
        return;
      }

      imageCleanup.commit();
      const activeTitle =
        values.translations[activeLanguage]?.title ||
        translations[0]?.title ||
        '';

      toast.success(mode === 'create' ? t('createSuccess') : t('updateSuccess'), {
        icon: <CardStackPlusIcon />,
        description: activeTitle,
      });

      router.push('/blog');
    } catch {
      toast.error(t('error'));
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
                  contentType="blog"
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
                        { shouldValidate: true, shouldDirty: true },
                      );
                    }
                    if (fields.content) {
                      form.setValue(
                        `translations.${language.code}.content`,
                        fields.content,
                        { shouldValidate: true, shouldDirty: true },
                      );
                    }
                    if (fields.summary) {
                      form.setValue(
                        `translations.${language.code}.summary`,
                        fields.summary,
                        { shouldValidate: true, shouldDirty: true },
                      );
                    }
                  }}
                />

                <FormField
                  control={form.control}
                  name={`translations.${language.code}.title`}
                  render={({ field, fieldState }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-xs">
                        {t('title')} ({language.name})
                        <FormRequiredIndicator />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder={t('titlePlaceholder')} {...field} />
                      </FormControl>
                      <FormFieldFooter>
                        <FormMessage />
                        <CharacterCount
                          value={field.value}
                          min={FIELD_LIMITS.blog.title.min}
                          max={FIELD_LIMITS.blog.title.max}
                          showMinWarning={fieldState.isDirty || fieldState.isTouched}
                        />
                      </FormFieldFooter>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 max-md:grid-cols-1 gap-5">
                  <Controller
                    control={form.control}
                    name={`translations.${language.code}.content`}
                    render={({ field, fieldState }) => (
                      <FormItem className="w-full">
                        <FormLabel className="text-xs">
                          {t('content')}
                          <FormRequiredIndicator />
                        </FormLabel>
                        <FormControl>
                          <RichTextEditor
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={t('contentPlaceholder')}
                          />
                        </FormControl>
                        <DeferredFieldError fieldState={fieldState} />
                      </FormItem>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name={`translations.${language.code}.summary`}
                    render={({ field, fieldState }) => (
                      <FormItem className="w-full">
                        <FormLabel className="text-xs">
                          {t('summary')}
                          <FormRequiredIndicator />
                        </FormLabel>
                        <FormControl>
                          <RichTextEditor
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={t('summaryPlaceholder')}
                          />
                        </FormControl>
                        <FormFieldFooter>
                          <DeferredFieldError fieldState={fieldState} />
                          <CharacterCount
                            value={stripHtmlText(field.value)}
                            min={FIELD_LIMITS.blog.summary.min}
                            max={FIELD_LIMITS.blog.summary.max}
                            showMinWarning={fieldState.isDirty || fieldState.isTouched}
                          />
                        </FormFieldFooter>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            );
          })()}

          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-5">
            <FormField
              control={form.control}
              name="tags"
              render={({ field, fieldState }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-xs">{t('tags')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('tagsPlaceholder')} {...field} />
                  </FormControl>
                  <FormFieldFooter>
                    <FormMessage />
                    <CharacterCount
                      value={field.value ?? ''}
                      max={FIELD_LIMITS.blog.taxonomy.max}
                      showMinWarning={fieldState.isDirty || fieldState.isTouched}
                    />
                  </FormFieldFooter>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categories"
              render={({ field, fieldState }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-xs">{t('categories')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('categoriesPlaceholder')} {...field} />
                  </FormControl>
                  <FormFieldFooter>
                    <FormMessage />
                    <CharacterCount
                      value={field.value ?? ''}
                      max={FIELD_LIMITS.blog.taxonomy.max}
                      showMinWarning={fieldState.isDirty || fieldState.isTouched}
                    />
                  </FormFieldFooter>
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-3 rounded-xl border border-border/40 bg-background/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('imagesSection')}
            </p>
            <div className="grid grid-cols-2 max-md:grid-cols-1 gap-5">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-xs">
                      {t('image')}
                      <FormRequiredIndicator />
                    </FormLabel>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      disabled={form.formState.isSubmitting}
                      heightClassName="h-48"
                      endpoint="blogImageUploader"
                      cleanup={imageCleanup}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shortImage"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-xs">
                      {t('shortImage')}
                      <FormRequiredIndicator />
                    </FormLabel>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      disabled={form.formState.isSubmitting}
                      heightClassName="h-48"
                      endpoint="blogImageUploader"
                      cleanup={imageCleanup}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <Button
              type="submit"
              variant="accent"
              className="max-w-56"
              disabled={submitDisabled}
            >
              {mode === 'create' ? t('submitCreate') : t('submitUpdate')}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={form.formState.isSubmitting}
              onClick={() => router.push('/blog')}
            >
              {t('cancel')}
            </Button>
          </div>
        </form>
      </Form>
    </ContentCard>
  );
}
