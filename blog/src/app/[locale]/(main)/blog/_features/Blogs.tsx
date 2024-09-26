'use client';

import { useRouter } from '@/navigation';
import { IGetBlog } from '@/types/blog';
import { useFormatter } from 'next-intl';
import NotfoundComponent from '../_components/notfound';
import { motion } from 'framer-motion';

type BlogFeatureProps = {
  data: IGetBlog[];
};

const BlogsFeature = ({ data }: BlogFeatureProps) => {
  const router = useRouter();
  const format = useFormatter();

  const handleNavigateToBlog = (id: string) => {
    router.push(`/blog/${id}`);
  };

  const publishedData = data.filter((blog) => blog.published);

  if (!publishedData.length) {
    return <NotfoundComponent />;
  }

  return (
    <div
      className="flex flex-wrap gap-5 w-full md:mt-10 mt-5"
      style={{
        justifyContent:
          publishedData.length % 2 === 0 ? 'space-evenly' : 'space-between',
      }}
    >
      {publishedData.map((blog: IGetBlog) => (
        <article
          key={blog.id}
          className="flex flex-col gap-2 w-96 max-sm:w-full h-[330px] shadow-md dark:shadow-slate-400/30 p-2 rounded-md hover:scale-105 transition-transform duration-200 ease-linear"
        >
          <figure className="flex flex-col justify-between gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={blog.shortImage || '/blog.jpg'}
              alt={blog.title}
              onClick={() => handleNavigateToBlog(blog.id)}
              className="w-full h-40 rounded-md object-cover hover:object-fill cursor-pointer"
            />
            <figcaption className="flex justify-between gap-2">
              <span className="text-sm line-clamp-1">
                {blog.author ? blog.author.name : 'Anonim'} -{' '}
                {blog.author && blog.author.role === 'SUPER_ADMIN'
                  ? 'Yönetici'
                  : 'Yazar'}
              </span>
              <span className="text-xs line-clamp-1 text-opacity-40">
                {format.relativeTime(new Date(blog.updatedAt))}
              </span>
            </figcaption>
          </figure>
          <div className="p-1 space-y-2">
            <h2
              className="text-lg font-bold cursor-pointer hover:text-teal-300"
              onClick={() => handleNavigateToBlog(blog.id)}
            >
              {blog.title}
            </h2>
            <p
              dangerouslySetInnerHTML={{ __html: blog.summary }}
              className="text-xs line-clamp-3 h-12"
            />
          </div>
          <motion.span
            animate={{
              scale: [0.5, 1],
              opacity: [0, 1],
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-[11px] text-slate-800/60 dark:text-slate-300/60 line-clamp-1 pl-1"
          >
            Eklenme tarihi: {format.relativeTime(new Date(blog.createdAt))}
          </motion.span>
        </article>
      ))}
    </div>
  );
};

export default BlogsFeature;
