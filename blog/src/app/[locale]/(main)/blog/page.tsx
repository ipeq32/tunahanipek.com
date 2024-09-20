import HeaderTemplate from '@/components/templates/HeaderTemplate';
import BlogsFeature from './_features/Blogs';

const blogs = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog`, {
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

async function page() {
  const blogData = await blogs();

  return (
    <>
      <HeaderTemplate
        title="Bloglar"
        description="Bloglar sayfası açıklama kısmı."
      />
      <BlogsFeature data={blogData} />
    </>
  );
}

export default page;
