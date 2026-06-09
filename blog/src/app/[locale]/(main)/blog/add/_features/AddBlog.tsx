'use client';

import BlogForm from '@/components/blog/BlogForm';

const AddBlogFeature = () => {
  return (
    <BlogForm
      mode="create"
      defaultValues={{
        image: '',
        shortImage: '',
        tags: '',
        categories: '',
      }}
    />
  );
};

export default AddBlogFeature;
