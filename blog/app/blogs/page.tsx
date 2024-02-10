import Blogs from '@components/Blogs/Blogs';
import { getAllBlogsWithDetails } from '@actions/Blog/getAllBlogs';
import { IBlogsWithDetails } from '@type/BlogTypes';
import { Metadata } from 'next';
import PageTemplate from '@components/Templates/PageTemplate';

type Props = {};

export const metadata: Metadata = {
  title: "Blogs",
  description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum.',
}

const page = async ({ }: Props) => {
  const blogs = await getAllBlogsWithDetails() as IBlogsWithDetails[];

  return (
    <PageTemplate title="Blogs" description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum." image="/blogs.svg">
      <Blogs blogs={blogs} />
    </PageTemplate>
  )
};

export default page;