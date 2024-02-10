'use client'

import React from "react";
import { HeartPulse, MoveRight, Tag } from "lucide-react";
import Link from "next/link";
import Pagination from "@components/Blogs/Pagination";
import Sidebar from "@components/Blogs/SidebarServer";
import { useState } from "react";
import { useAtom } from "jotai";
import { blog } from "@jotai/atoms";
import { IBlogsWithDetails } from "@type/BlogTypes";

type Props = {
  blogs: IBlogsWithDetails[];
};

const Blogs = ({ blogs }: Props) => {
  const [isMenuOpen] = useAtom(blog.blogSidebarOpenAtom);
  const [currentPage, setCurrentPage] = useState(1);
  const [blogsPerPage] = useState(6);

  const indexOfLastPost = currentPage * blogsPerPage;
  const indexOfFirstPost = indexOfLastPost - blogsPerPage;
  const currentBlogs = blogs?.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const getDate = (timestamp: Date): string => new Date(timestamp).toLocaleString("en", {
    day: "numeric",
  });

  const getMonth = (timestamp: Date): string => new Date(timestamp).toLocaleString("en", {
    month: "short",
  })

  return (
    <div className="flex flex-row-reverse w-full gap-5 max-md:flex-col">
      <Sidebar />
      {!isMenuOpen && (
        <div className="grid grid-cols-2 w-full gap-5 h-max max-lg:grid-cols-1">
          {currentBlogs?.map((blog, index) => (
            <div key={index} className="relative flex flex-col group/blog h-[500px] w-full gap-3 border border-slate-500 rounded-md hover:-translate-y-1">
              <figure className="w-full h-2/5">
                <img src={blog.image} alt="logo" className="w-full h-full object-cover rounded-t-md group-hover/blog:grayscale-0 grayscale" />
              </figure>
              <div className="absolute right-5 top-5">
                <time className="flex flex-col justify-center items-center w-16 py-2 bg-gray-500 group-hover/blog:bg-slate-500 rounded-tl-xl rounded-br-xl">
                  <span className="group-hover/blog:text-slate-50 text-slate-200 text-2xl tracking-widest select-none">{getDate(blog.createdAt)}</span>
                  <span className="group-hover/blog:text-slate-200 text-slate-300 select-none">{getMonth(blog.createdAt)}</span>
                </time>
              </div>
              <header className="flex flex-col justify-center w-full h-2/5 px-5 pt-2 gap-5">
                <div className="flex flex-row items-center gap-5">
                  <div className="flex flex-row items-center gap-2 group/title">
                    <HeartPulse className="group-hover/blog:text-red-500 text-slate-400 group-hover/title:scale-105" />
                    <Link href={`blogs/users/${blog.user?.id}`} className="text-base text-slate-400 group-hover/blog:text-emerald-400 line-clamp-1">{blog.user?.firstName}</Link>
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <Tag width={15} height={15} className="group-hover/blog:text-blue-300" />
                    <div className="flex flex-row items-center gap-2">
                      {blog.tags.map((tag, index) => (
                        <Link href={`/blogs/tags/${tag.id}`} key={index} className="text-xs text-slate-400 group-hover/blog:text-rose-100 hover:scale-105">{tag.name}</Link>
                      ))}
                    </div>
                  </div>
                </div>
                <h2 className="text-xl text-slate-400 group-hover/blog:text-slate-200 line-clamp-2">{blog.title}</h2>
                <p className="text-sm text-slate-500 group-hover/blog:text-slate-300 line-clamp-4">{blog.content}</p>
              </header>
              <footer className="flex justify-center items-center w-full h-1/5 px-5">
                <Link href={`/blogs/${blog.id}`} className="relative flex items-center gap-4 group/button px-7 z-10 h-2/3 text-slate-300 rounded-md focus:outline-none ring-2 ring-slate-400 focus:ring-slate-500 focus:border-transparent">
                  <span className="absolute bg-gradient-to-tr from-orange-600 via-violet-600 to-sky-600 bottom-0 left-1/2 translate-x-[-50%] w-0 h-full group-hover/button:w-full rounded-md transition-all duration-300 ease-linear" />
                  <p className="block z-10 text-2xl max-md:text-lg select-none">Read More</p>
                  <MoveRight strokeWidth={4} className='flex items-center z-10 group-hover/button:animate-slide-in-right select-none group-hover/button:text-slate-100 text-slate-400' />
                </Link>
              </footer>
            </div>
          ))}
          <div className="col-span-2 max-lg:col-span-1">
            <Pagination
              requestsPerPage={blogsPerPage}
              totalRequests={blogs?.length}
              paginate={paginate}
              currentPage={currentPage}
            />
          </div>
        </div>
      )}
    </div>
  )
};

export default Blogs;