'use client';

import { IGetBlog } from '@/types/blog';
import { sanitizeHtml } from '@/lib/sanitize';
import { useFormatter, useTranslations } from 'next-intl';
import NotfoundComponent from '../../_components/notfound';
import { motion } from 'framer-motion';
import Image from 'next/image';

type BlogFeatureProps = {
  data: IGetBlog;
};

const BlogFeature = ({ data: blogData }: BlogFeatureProps) => {
  const format = useFormatter();
  const t = useTranslations('Blog');

  const data = blogData.published ? blogData : null;

  if (!data) {
    return <NotfoundComponent />;
  }

  return (
    <div className="container mt-10 max-md:mt-5 flex flex-col gap-5">
      <figure className="flex justify-center items-center max-h-[500px] overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src={data.image || '/blog.jpg'}
            alt={data.title}
            width={1200}
            height={500}
            unoptimized
            className="object-cover w-full max-h-[500px]"
          />
        </motion.div>
      </figure>
      <div className="flex flex-col gap-3">
        <div className="flex max-sm:flex-col-reverse justify-between items-center sm:gap-5 shadow-md dark:shadow-slate-700 px-1">
          <motion.h2
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center text-lg font-bold italic"
          >
            <Image
              src={
                data.author.image ||
                'https://img.icons8.com/?size=100&id=21441&format=png&color=000000'
              }
              alt={data.author.name}
              width={20}
              height={20}
              unoptimized
              className="rounded-full h-5 w-5 m-1"
            />
            {data.author.name} -{' '}
            {data.author.role === 'SUPER_ADMIN'
              ? t('roleAdmin')
              : t('roleAuthor')}
          </motion.h2>
          <time className="max-sm:text-end text-xs ">
            {format.dateTime(new Date(data.createdAt))}
          </time>
        </div>
        <div className="flex flex-col justify-center gap-5 w-full mt-10 max-md:mt-5">
          <h1 className="text-center text-xl">{data.title}</h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(data.content),
            }}
            className="text-sm prose dark:prose-invert max-w-none"
          />
        </div>
      </div>
    </div>
  );
};

export default BlogFeature;
