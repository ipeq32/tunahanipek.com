'use client';

import { IGetBlog } from '@/types/blog';
import { useFormatter } from 'next-intl';

type BlogFeatureProps = {
  data: IGetBlog;
};

const BlogFeature = ({ data }: BlogFeatureProps) => {
  const format = useFormatter();

  if (!data) {
    return <div>No data available</div>;
  }

  console.log(data);

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
          <h2 className="flex items-center text-lg font-bold italic">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                data.user.image ||
                'https://img.icons8.com/?size=100&id=21441&format=png&color=000000'
              }
              alt={data.user.name}
              className="rounded-full h-5 w-5 m-1"
            />
            {data.user.name} -{' '}
            {data.user.role === 'SUPER_ADMIN' ? 'Yönetici' : 'Yazar'}
          </h2>
          <time className="max-sm:text-end text-xs ">
            {format.dateTime(new Date(data.createdAt))}
          </time>
        </div>
        <div className="flex flex-col justify-center gap-5 w-full mt-10 max-md:mt-5">
          <h1 className="text-center text-xl">{data.title}</h1>
          <p
            dangerouslySetInnerHTML={{ __html: data.content }}
            className="text-center text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default BlogFeature;
