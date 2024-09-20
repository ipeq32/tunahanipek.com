'use client';

import { useRouter } from '@/navigation';
import { IGetBlog } from '@/types/blog';

type BlogFeatureProps = {
  data: IGetBlog[];
};

const BlogFeature = ({ data }: BlogFeatureProps) => {
  const router = useRouter();

  const handleNavigateToBlog = (id: string) => {
    router.push(`/blog/${id}`);
  };

  return (
    <div className="flex flex-wrap justify-evenly gap-5 w-full md:mt-10 mt-5">
      {data.map((blog) => (
        <article
          key={blog.id}
          className="flex flex-col gap-2 w-96 max-sm:w-full h-[300px] shadow-md dark:shadow-slate-400/30 p-2 rounded-md hover:scale-105 transition-transform duration-200 ease-linear"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={blog.shortImage || '/blog.jpg'}
            alt={blog.title}
            onClick={() => handleNavigateToBlog(blog.id)}
            className="w-full h-40 rounded-md object-cover hover:object-fill cursor-pointer"
          />
          <figure>
            <figcaption className="text-sm line-clamp-1">
              {blog.user.name} -{' '}
              {blog.user.role === 'SUPER_ADMIN' ? 'Yönetici' : 'Yazar'}
            </figcaption>
          </figure>
          <div className="p-1">
            <h2
              className="text-lg font-bold cursor-pointer hover:text-teal-300"
              onClick={() => handleNavigateToBlog(blog.id)}
            >
              {blog.title}
            </h2>
            <p
              dangerouslySetInnerHTML={{ __html: blog.summary }}
              className="text-xs line-clamp-3"
            />
          </div>
        </article>
      ))}
    </div>
  );
};

export default BlogFeature;
