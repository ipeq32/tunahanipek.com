import BlogId from "@components/Blogs/BlogId";
import { getBlogWithDetails } from "@actions/Blog/getBlog";
import { IBlogsWithDetails } from "@type/BlogTypes";
import { Metadata, ResolvingMetadata } from "next";
import PageTemplate from "@components/Templates/PageTemplate";

type Props = {
  params: {
    id: string;
  }
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id

  const blog = await getBlogWithDetails(id) as IBlogsWithDetails;

  const previousImages = (await parent).openGraph?.images || []

  return {
    title: blog.user?.firstName,
    openGraph: {
      images: [blog.image, ...previousImages],
      username: blog.user?.firstName,
      title: blog.title,
      description: blog.content,
      url: `https://www.blog.tunahanipek.com/blogs/${id}`,
      emails: [`${blog.user?.email}`],
    },
  }
}

const page = async ({ params: { id } }: Props) => {
  const blog = await getBlogWithDetails(id) as IBlogsWithDetails;

  return (
    <PageTemplate title={blog.user?.firstName ? blog.user?.firstName : "Blog"} description={blog.title} image={blog.image}>
      <BlogId blog={blog} id={id} />
    </PageTemplate>
  )
};

export default page;