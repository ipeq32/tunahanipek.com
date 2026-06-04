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
import { CardStackPlusIcon } from '@radix-ui/react-icons';
import { Input } from '@/components/ui/input';
import ImageUpload from '@/components/upload/ImageUpload';
import { useUploadCleanup } from '@/components/upload/use-upload-cleanup';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/navigation';
import { ContentCard } from '@/components/layout/content-card';
import RichTextEditor from '@/components/blog/RichTextEditor';

const formSchema = z.object({
  title: z.string().min(2),
  image: z.string().min(2),
  shortImage: z.string().min(2),
  content: z.string().min(17),
  summary: z.string().min(17),
  tags: z.string().optional(),
  categories: z.string().optional(),
});

export type BlogFormValues = z.infer<typeof formSchema>;

type BlogFormProps = {
  mode: 'create' | 'edit';
  blogId?: string;
  defaultValues: BlogFormValues;
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
  const t = useTranslations('Blog.Form');
  const imageCleanup = useUploadCleanup();

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    Object.values(form.formState.errors).forEach((error) => {
      if (error?.message) toast(error.message as string);
    });
  }, [form.formState.errors]);

  async function onSubmit(values: BlogFormValues) {
    const url =
      mode === 'create'
        ? `/api/blog/add`
        : `/api/blog/${blogId}`;

    const method = mode === 'create' ? 'POST' : 'PATCH';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const apiError = await parseApiError(res);
        toast.error(t('error'), {
          description: apiError,
        });
        return;
      }

      imageCleanup.commit();
      toast.success(mode === 'create' ? t('createSuccess') : t('updateSuccess'), {
        icon: <CardStackPlusIcon />,
        description: values.title,
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
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs">
                  {t('title')} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder={t('titlePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-5">
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-xs">{t('tags')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('tagsPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categories"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-xs">{t('categories')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('categoriesPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
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
                      {t('image')} <span className="text-red-500">*</span>
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
                      {t('shortImage')} <span className="text-red-500">*</span>
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
          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-5">
            <Controller
              control={form.control}
              name="content"
              render={({ field, fieldState }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-xs">
                    {t('content')} <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t('contentPlaceholder')}
                    />
                  </FormControl>
                  {fieldState.error && (
                    <p className="text-sm font-medium text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </FormItem>
              )}
            />
            <Controller
              control={form.control}
              name="summary"
              render={({ field, fieldState }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-xs">
                    {t('summary')} <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t('summaryPlaceholder')}
                    />
                  </FormControl>
                  {fieldState.error && (
                    <p className="text-sm font-medium text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              type="submit"
              variant="accent"
              className="max-w-56"
              disabled={form.formState.isSubmitting}
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
