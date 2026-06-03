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
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/navigation';
import { ContentCard } from '@/components/layout/content-card';

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div className="h-40 w-full animate-pulse rounded-md border border-border/60 bg-muted/40" />
  ),
});

const formSchema = z.object({
  title: z.string().trim().min(2).max(200),
  url: z.string().url().optional().or(z.literal('')),
  image: z.string().url().optional().or(z.literal('')),
  description: z.string().min(2),
  published: z.boolean(),
});

export type ProjectFormValues = z.infer<typeof formSchema>;

type ProjectFormProps = {
  mode: 'create' | 'edit';
  projectId?: string;
  defaultValues: ProjectFormValues;
};

export default function ProjectForm({
  mode,
  projectId,
  defaultValues,
}: ProjectFormProps) {
  const router = useRouter();
  const t = useTranslations('Admin.Project');
  const imageCleanup = useUploadCleanup();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  async function onSubmit(values: ProjectFormValues) {
    const url =
      mode === 'create'
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/projects/admin`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}`;

    const payload = {
      title: values.title.trim(),
      description: values.description,
      url: values.url?.trim() || '',
      image: values.image?.trim() || '',
      published: values.published,
    };

    try {
      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        toast.error(t('actionError'));
        return;
      }

      // Görsel kaydedildi; oturum temizliğinde silinmesini engelle.
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
                  cleanup={imageCleanup}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    {t('fieldTitle')} <span className="text-red-500">*</span>
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
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">
                  {t('fieldDescription')} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <ReactQuill
                    theme="snow"
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
            name="published"
            render={({ field }) => (
              <label className="flex w-fit items-center gap-2 rounded-lg border border-border/40 bg-background/40 px-3 py-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-teal-600"
                />
                {t('fieldPublished')}
              </label>
            )}
          />

          <div className="flex flex-wrap gap-2 border-t border-border/40 pt-4">
            <Button
              type="submit"
              variant="accent"
              disabled={form.formState.isSubmitting}
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
