import BlogFeature from './_features/Blog';
import BlogComments from '@/components/blog/BlogComments';
import { getPublishedBlogById } from '@/lib/data/blogs';
import { getApprovedComments } from '@/lib/data/comments';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const revalidate = 60;

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const blog = await getPublishedBlogById(id);

  if (!blog) {
    return { title: 'Blog bulunamadı' };
  }

  const plainSummary = blog.summary.replace(/<[^>]*>/g, '').slice(0, 160);

  return {
    title: blog.title,
    description: plainSummary,
    openGraph: {
      title: blog.title,
      description: plainSummary,
      images: blog.image ? [blog.image] : [],
    },
  };
}

async function page({ params }: Props) {
  const { id } = await params;
  const [blogData, comments] = await Promise.all([
    getPublishedBlogById(id),
    getApprovedComments(id),
  ]);

  if (!blogData) {
    notFound();
  }

  return (
    <>
      <BlogFeature data={blogData} />
      <BlogComments blogId={id} initialComments={comments} />
    </>
  );
}

export default page;
