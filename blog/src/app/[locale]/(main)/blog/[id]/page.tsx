import BlogFeature from './_features/Blog';
import { logger } from '@/lib/logger';
import { IGetBlog } from '@/types/blog';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{
    id: string;
    locale: string;
  }>;
};

const fetchBlog = async (id: string): Promise<IGetBlog | null> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/blog/${id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      return null;
    }

    const { data } = await res.json();
    return data;
  } catch (error) {
    logger.error('Error fetching blog', {
      id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const blog = await fetchBlog(id);

  if (!blog) {
    return { title: 'Blog bulunamadı' };
  }

  return {
    title: blog.title,
    description: blog.summary.replace(/<[^>]*>/g, '').slice(0, 160),
    openGraph: {
      title: blog.title,
      description: blog.summary.replace(/<[^>]*>/g, '').slice(0, 160),
      images: blog.image ? [blog.image] : [],
    },
  };
}

async function page({ params }: Props) {
  const { id } = await params;
  const blogData = await fetchBlog(id);

  if (!blogData) {
    return null;
  }

  return <BlogFeature data={blogData} />;
}

export default page;
