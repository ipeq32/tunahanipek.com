import HeaderTemplate from '@/components/templates/HeaderTemplate';
import BlogsFeature from './_features/Blogs';
import PaginationComponent from '@/components/pagination';
import { logger } from '@/lib/logger';
import { IGetBlog } from '@/types/blog';

const blogs = async (page: number, limit: number) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/blog?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch, status: ${res.status}`);
    }

    const { data, total } = await res.json();
    return { data, total };
  } catch (error) {
    logger.error('Error fetching blogs', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return { data: [], total: 0 };
  }
};

type Props = {
  searchParams: Promise<{
    page: string;
    limit: string;
  }>;
};

async function page({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams.page || '1');
  const limit = parseInt(resolvedSearchParams.limit || '9');
  const { data: blogData, total } = await blogs(currentPage, limit);

  return (
    <>
      <HeaderTemplate
        title="Bloglar"
        description="Bloglar sayfası açıklama kısmı."
      />
      <BlogsFeature data={blogData as IGetBlog[]} />
      <PaginationComponent
        total={total}
        currentPage={currentPage}
        limit={limit}
        isShowPagination={total > limit}
      />
    </>
  );
}

export default page;
