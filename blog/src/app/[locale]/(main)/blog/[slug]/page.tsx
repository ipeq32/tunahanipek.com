import BlogFeature from './_features/Blog';

type Props = {
  params: {
    slug: string;
  };
};

const fetchBlog = async (slug: string) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // mode: 'cors',
    });

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

const page = async ({ params: { slug } }: Props) => {
  const blogData = await fetchBlog(slug);

  return <BlogFeature data={blogData} />;
};

export default page;
