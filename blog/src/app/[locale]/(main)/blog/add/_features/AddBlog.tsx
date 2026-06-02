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
} from '@/components/ui/form';
import { CardStackPlusIcon } from '@radix-ui/react-icons';
import { Input } from '@/components/ui/input';
import { useEffect } from 'react';
import { toast } from 'sonner';
import ReactQuill from 'react-quill';
import { useLocale } from 'next-intl';
import { useRouter } from '@/navigation';

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Blog name must be at least 2 characters.',
  }),
  image: z.string().min(2, {
    message: 'Blog image must be at least 2 characters.',
  }),
  shortImage: z.string().min(2, {
    message: 'Blog shortImage must be at least 2 characters.',
  }),
  // content: "<p><br></p>" => default content boşken böyle oluyor. Bişeyler yazınca <p>12w</p> böyle oluyor. O yüzden 17 olmalı.
  content: z.string().min(17, {
    message: 'Blog content must be at least 10 characters.',
  }),
  summary: z.string().min(17, {
    message: 'Blog content must be at least 10 characters.',
  }),
});

const AddBlogFeature = () => {
  const locale = useLocale();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      image: '',
      shortImage: '',
      content: locale === 'tr' ? 'İçerik' : 'Content',
      summary: locale === 'tr' ? 'Özet' : 'Summary',
    },
  });

  useEffect(() => {
    if (form.formState.errors.title)
      toast(form.formState.errors.title?.message);
    if (form.formState.errors.image)
      toast(form.formState.errors.image?.message);
    if (form.formState.errors.shortImage)
      toast(form.formState.errors.shortImage?.message);
    if (form.formState.errors.content)
      toast(form.formState.errors.content?.message);
    if (form.formState.errors.summary)
      toast(form.formState.errors.summary?.message);
  }, [form.formState.errors]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { content, image, shortImage, summary, title } = values;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          image,
          shortImage,
          summary,
          title,
        }),
      });

      if (res.status !== 200) {
        toast('Bir hata oluştu.');
      }

      toast('Blog başarıyla eklendi.', {
        icon: <CardStackPlusIcon />,
        description: form.getValues('title'),
      });

      router.push('/blog');

      return res;
    } catch {
      toast('Blog eklemesi başarısız oldu.');
    }
  }

  return (
    <div className="flex justify-center w-full mt-5">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5 w-full md:mt-10"
        >
          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-xs text-black dark:text-white">
                    Blog Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl className="w-full">
                    <Input
                      className="text-black dark:text-white w-full"
                      placeholder={'Enter blog name'}
                      {...field}
                      type="text"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-xs text-black dark:text-white">
                    Resim URL <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl className="w-full">
                    <Input
                      className="text-black dark:text-white w-full"
                      placeholder={'Enter blog image'}
                      {...field}
                      type="text"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shortImage"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-xs text-black dark:text-white">
                    Küçük Resim URL <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl className="w-full">
                    <Input
                      className="text-black dark:text-white w-full"
                      placeholder={'Enter blog shortImage'}
                      {...field}
                      type="text"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-5">
            <Controller
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-xs text-black dark:text-white">
                    Blog Content <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <ReactQuill
                      theme="snow"
                      {...field}
                      // value={field.value}
                      // onChange={field.onChange}
                      className="placeholder:text-red-300"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Controller
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-xs text-black dark:text-white">
                    Blog Summary <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <ReactQuill
                      theme="snow"
                      {...field}
                      // value={field.value}
                      // onChange={field.onChange}
                      className="placeholder:text-red-300"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="max-w-56 mx-auto">
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AddBlogFeature;
