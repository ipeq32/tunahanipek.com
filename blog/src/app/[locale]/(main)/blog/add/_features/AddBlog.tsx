'use client';

import BlogForm from '@/components/blog/BlogForm';
import { useLocale } from 'next-intl';

const AddBlogFeature = () => {
  const locale = useLocale();

  return (
    <BlogForm
      mode="create"
      defaultValues={{
        title: '',
        image: '',
        shortImage: '',
        content: locale === 'tr' ? '<p>İçerik</p>' : '<p>Content</p>',
        summary: locale === 'tr' ? '<p>Özet</p>' : '<p>Summary</p>',
        tags: '',
        categories: '',
      }}
    />
  );
};

export default AddBlogFeature;
