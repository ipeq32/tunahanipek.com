import BlogFeature from './_features/Blog';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const fetchBlog = async (id: string) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/blog/${id}`,
      {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // mode: 'cors',
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch, status: ${res.status}`);
    }

    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
};

const page = async ({ params }: Props) => {
  const { id } = await params;
  const blogData = await fetchBlog(id);

  return <BlogFeature data={blogData} />;
};

export default page;
