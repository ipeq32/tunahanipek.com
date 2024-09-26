'use client';

import { IGetBlog } from '@/types/blog';
import { useFormatter } from 'next-intl';
import NotfoundComponent from '../../_components/notfound';
import { motion } from 'framer-motion';

type BlogFeatureProps = {
  data: IGetBlog;
};

const BlogFeature = ({ data: blogData }: BlogFeatureProps) => {
  const format = useFormatter();

  const data = blogData.published ? blogData : null;

  if (!data) {
    return <NotfoundComponent />;
  }

  return (
    <div className="container mt-10 max-md:mt-5 flex flex-col gap-5">
      <figure className="flex justify-center items-center max-h-[500px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.image || '/blog.jpg'}
          alt={data.title}
          className="object-cover"
        />
      </figure>
      <div className="flex flex-col gap-3">
        <div className="flex max-sm:flex-col-reverse justify-between items-center sm:gap-5 shadow-md dark:shadow-slate-700 px-1">
          <motion.h2
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center text-lg font-bold italic"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                data.author
                  ? data.author.image
                  : 'https://img.icons8.com/?size=100&id=21441&format=png&color=000000'
              }
              alt={data.author ? data.author.name : 'Anonim'}
              className="rounded-full h-5 w-5 m-1"
            />
            {data.author ? data.author.name : 'Anonim'} -{' '}
            {data.author && data.author.role === 'SUPER_ADMIN'
              ? 'Yönetici'
              : 'Yazar'}
          </motion.h2>
          <time className="max-sm:text-end text-xs ">
            {format.dateTime(new Date(data.createdAt))}
          </time>
        </div>
        <div className="flex flex-col justify-center gap-5 w-full mt-10 max-md:mt-5">
          <h1 className="text-center text-xl">{data.title}</h1>
          <p
            dangerouslySetInnerHTML={{ __html: data.content }}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default BlogFeature;
