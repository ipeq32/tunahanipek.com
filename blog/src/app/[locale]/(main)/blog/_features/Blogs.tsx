import { IGetBlog } from '@/types/blog';
import NotfoundComponent from '../_components/notfound';
import BlogCard from '@/components/blog/BlogCard';

type BlogFeatureProps = {
  data: IGetBlog[];
};

export default function BlogsFeature({ data }: BlogFeatureProps) {
  const publishedData = data.filter((blog) => blog.published);

  if (!publishedData.length) {
    return <NotfoundComponent />;
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {publishedData.map((blog) => (
        <BlogCard key={blog.id} blog={blog} />
      ))}
    </div>
  );
}
