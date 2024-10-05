import MainFeature from './_features/Main';

const blogs = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

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

async function page() {
  const { data } = await blogs();

  return <MainFeature blogs={[...data, ...data, ...data]} />;
}

export default page;
