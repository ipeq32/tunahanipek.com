import HeaderTemplate from '@/components/templates/HeaderTemplate';
import BlogsFeature from './_features/Blogs';

const blogs = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const { data } = await res.json();

  return data;
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
