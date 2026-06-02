import HeaderTemplate from '@/components/templates/HeaderTemplate';
import BlogsFeature from './_features/Blogs';
import PaginationComponent from '@/components/pagination';
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
    console.error('Error fetching blogs:', error);
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

  const publishedData: IGetBlog[] = blogData.filter(
    (blog: IGetBlog) => blog.published
  );

  const dataLength = publishedData.length > limit;

  return (
    <>
      <HeaderTemplate
        title="Bloglar"
        description="Bloglar sayfası açıklama kısmı."
      />
      <BlogsFeature data={blogData} />
      <PaginationComponent
        total={total}
        currentPage={currentPage}
        limit={limit}
        isShowPagination={dataLength}
      />
    </>
  );
}

export default page;
