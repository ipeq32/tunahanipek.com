"use client"

import { IBlogsWithDetails } from "@type/BlogTypes";
import { blog as blogAtom } from "@jotai/atoms";
import { useAtom } from "jotai";
import { HeartPulse, Tag as TagIcon, CalendarDays, MoveRight, Reply } from "lucide-react";
import Link from "next/link";
import React from "react";
import Sidebar from "@components/Blogs/SidebarServer";

type Props = {
  blog: IBlogsWithDetails
  id: string;
};

const BlogId = ({ blog, id }: Props) => {
  const [isMenuOpen] = useAtom(blogAtom.blogSidebarOpenAtom);

  const numberDay = new Date(blog?.createdAt).getDate();
  const stringMonth = new Date(blog?.createdAt).toLocaleString("en", {
    month: "short",
  });

  return (
    <div className="flex flex-row-reverse w-full gap-5 max-md:flex-col">
      <Sidebar id={id} userData={blog as Pick<IBlogsWithDetails, "user"> | null} />
      {!isMenuOpen && (
        <div className="flex flex-col w-full rounded-md">
          <figure className="relative w-full h-[500px] group/image rounded-md shadow-md shadow-slate-400">
            <img src={blog?.image} alt="logo" className="w-full h-full object-cover rounded-md" />
            <div className="absolute -bottom-14 right-5">
              {/* TODO: Burada hydration yiyebilir. Yorum satırına al tekrar aç düzelir. */}
              <time className="flex flex-col justify-center items-center p-5 bg-gray-500 group-hover/image:bg-slate-500 rounded-tl-xl rounded-br-xl">
                <span className="group-hover/image:text-slate-50 text-slate-200 text-5xl tracking-widest select-none">{numberDay}</span>
                <span className="group-hover/image:text-slate-200 text-slate-300 text-2xl select-none">{stringMonth}</span>
              </time>
            </div>
          </figure>
          <div className="flex flex-row items-center gap-5 mt-10 max-mobile-xl:flex-col max-mobile-xl:items-start">
            <div className="flex flex-row items-center group/profile gap-2">
              <HeartPulse className="group-hover/profile:text-red-500 text-slate-400" />
              <Link href={`blogs/users/${blog?.user?.id}`} className="text-base text-slate-400 group-hover/profile:text-emerald-400 line-clamp-1">{blog?.user?.firstName}</Link>
            </div>
            <div className="flex flex-row items-center group/tag gap-1">
              <TagIcon width={15} height={15} className="group-hover/tag:text-blue-300" />
              <div className="flex flex-row items-center gap-2">
                {blog?.tags.map((tag, index) => (
                  <Link key={index} href={`/blogs/tags/${tag.id}`} className="text-xs text-slate-400 group-hover/tag:text-slate-200 hover:scale-105">{tag.name}</Link>
                ))}
              </div>
            </div>
          </div>
          <header className="flex flex-col justify-center items-center gap-5 mt-5">
            <h1 className="text-4xl max-md:text-3xl max-md:text-center">{blog?.title}</h1>
            <p className="text-lg line-clamp-4 max-md:text-sm max-md:text-center">{blog?.content}</p>
          </header>
          <div className="flex flex-col justify-center items-start gap-5 mt-20">
            <h1 className="text-2xl max-md:text-xl">Related Post</h1>
            <div className="grid grid-cols-2 gap-3 w-full h-max max-lg:grid-cols-1">
              <div className="flex flex-col group/image items-center gap-3 border rounded-md">
                <img src="https://cdn3.iconfinder.com/data/icons/logos-brands-3/24/logo_brand_brands_logos_ubuntu-512.png" alt="image" className="w-full h-64 p-5 group-hover/image:grayscale-0 grayscale object-contain" />
                <div className="flex flex-row items-center justify-evenly w-full">
                  <div className="flex flex-row items-center gap-2">
                    <HeartPulse className="group-hover/image:text-red-500" />
                    <Link href={"/"} className="text-base text-slate-300 group-hover/image:text-emerald-400">Administrator</Link>
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <CalendarDays width={15} height={15} className="group-hover/image:text-blue-300" />
                    <p className="text-xs text-slate-400 group-hover/tag:text-slate-200">12.05.2022</p>
                  </div>
                </div>
                <div className="flex flex-col items-center px-5 gap-5">
                  <p className="text-xl text-slate-400 group-hover/image:text-slate-200 line-clamp-4">Makes It The Ideal Theme For Fast Business?</p>
                  <p className="text-sm text-slate-500 group-hover/image:text-slate-300 line-clamp-4">Be distracted by the readable content a page when looking at its layout.</p>
                </div>
                <Link href={"/"} target='_blank' className="relative flex justify-center items-center my-10 gap-3 px-6 py-3">
                  <span className="absolute bg-gradient-to-bl from-indigo-500 via-purple-500 to-pink-500  bottom-0 right-0 w-0 h-0 group-hover/image:w-full group-hover/image:h-full rounded-md transition-all duration-300 ease-linear" />
                  <p className="flex items-center z-10">Explore More</p>
                  <MoveRight strokeWidth={4} className='flex items-center z-10 group-hover/image:animate-slide-in-right group-hover/image:text-slate-100 text-slate-300' />
                  <span className="absolute bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 top-0 left-0 w-0 h-0 group-hover/image:w-full group-hover/image:h-full rounded-md transition-all duration-300 ease-linear" />
                </Link>
              </div>
              <div className="flex flex-col group/image items-center gap-3 border rounded-md">
                <img src="https://cdn3.iconfinder.com/data/icons/logos-brands-3/24/logo_brand_brands_logos_ubuntu-512.png" alt="image" className="w-full h-64 p-5 group-hover/image:grayscale-0 grayscale object-contain" />
                <div className="flex flex-row items-center justify-evenly w-full">
                  <div className="flex flex-row items-center gap-2">
                    <HeartPulse className="group-hover/image:text-red-500" />
                    <Link href={"/"} className="text-base text-slate-300 group-hover/image:text-emerald-400">Administrator</Link>
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <CalendarDays width={15} height={15} className="group-hover/image:text-blue-300" />
                    <p className="text-xs text-slate-400 group-hover/tag:text-slate-200">25.12.2018</p>
                  </div>
                </div>
                <div className="flex flex-col items-center px-5 gap-5">
                  <p className="text-xl text-slate-400 group-hover/image:text-slate-200 line-clamp-4">Makes It The Ideal Theme For Fast Business?</p>
                  <p className="text-sm text-slate-500 group-hover/image:text-slate-300 line-clamp-4">Be distracted by the readable content a page when looking at its layout.</p>
                </div>
                <Link href={"/"} target='_blank' className="relative flex justify-center items-center my-10 gap-3 px-6 py-3">
                  <span className="absolute bg-gradient-to-bl from-indigo-500 via-purple-500 to-pink-500  bottom-0 right-0 w-0 h-0 group-hover/image:w-full group-hover/image:h-full rounded-md transition-all duration-300 ease-linear" />
                  <p className="flex items-center z-10">Explore More</p>
                  <MoveRight strokeWidth={4} className='flex items-center z-10 group-hover/image:animate-slide-in-right group-hover/image:text-slate-100 text-slate-300' />
                  <span className="absolute bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 top-0 left-0 w-0 h-0 group-hover/image:w-full group-hover/image:h-full rounded-md transition-all duration-300 ease-linear" />
                </Link>
              </div>
            </div>
            <div className="flex flex-col items-start gap-5">
              <h1 className="text-2xl max-md:text-xl">(2) Comments</h1>
              <div className="flex flex-col items-center group/comment gap-5 w-full max-md:px-5 max-mobile-xl:p-0 hover:bg-emerald-300/10 rounded-md px-2 py-1 hover:shadow-sm hover:shadow-slate-400">
                <div className="flex flex-row items-center justify-between w-full">
                  <div className="flex flex-row items-center gap-5 w-full">
                    <div className="flex items-center justify-center">
                      <img src="https://cdn3.iconfinder.com/data/icons/logos-brands-3/24/logo_brand_brands_logos_ubuntu-512.png" alt="logo" className="w-20 h-20 object-contain rounded-full" />
                    </div>
                    <div className="flex flex-col gap-3 items-start">
                      <div className="flex flex-row items-center gap-2">
                        <Link href={"/"} className="text-base text-slate-400 group-hover/comment:text-cyan-400 line-clamp-1">Dena Rogahn</Link>
                      </div>
                      <div className="flex flex-row items-center gap-1">
                        <p className="text-xs text-slate-400 group-hover/comment:text-slate-200">12.05.2022</p>
                      </div>
                    </div>
                  </div>
                  <button className="flex flex-row justify-center items-center hover:bg-sky-300 gap-2 px-2 py-1 max-mobile-xl:mr-1 rounded-md hover:text-slate-600">
                    <Reply />
                    <p className="text-lg">Reply</p>
                  </button>
                </div>
                <div className="flex flex-col items-center gap-5 w-full">
                  <p className="text-sm text-slate-500 line-clamp-4 group-hover/comment:text-slate-300">Be distracted by the readable content a page when looking at its layout. Be distracted by the readable content a page when looking at its layout. Be distracted by the readable content a page when looking at its layout.</p>
                </div>
              </div>
              <div className="flex flex-col items-center group/comment gap-5 w-full max-md:px-5 max-mobile-xl:p-0 hover:bg-emerald-300/10 rounded-md px-2 py-1 hover:shadow-sm hover:shadow-slate-400">
                <div className="flex flex-row items-center justify-between w-full">
                  <div className="flex flex-row items-center gap-5 w-full">
                    <div className="flex items-center justify-center">
                      <img src="https://cdn3.iconfinder.com/data/icons/logos-brands-3/24/logo_brand_brands_logos_ubuntu-512.png" alt="logo" className="w-20 h-20 object-contain rounded-full" />
                    </div>
                    <div className="flex flex-col gap-3 items-start">
                      <div className="flex flex-row items-center gap-2">
                        <Link href={"/"} className="text-base text-slate-400 group-hover/comment:text-cyan-400 line-clamp-1">Dena Rogahn</Link>
                      </div>
                      <div className="flex flex-row items-center gap-1">
                        <p className="text-xs text-slate-400 group-hover/comment:text-slate-200">12.05.2022</p>
                      </div>
                    </div>
                  </div>
                  <button className="flex flex-row justify-center items-center hover:bg-sky-300 gap-2 px-2 py-1 max-mobile-xl:mr-1 rounded-md hover:text-slate-600">
                    <Reply />
                    <p className="text-lg">Reply</p>
                  </button>
                </div>
                <div className="flex flex-col items-center gap-5 w-full">
                  <p className="text-sm text-slate-500 line-clamp-4 group-hover/comment:text-slate-300">Be distracted by the readable content a page when looking at its layout. Be distracted by the readable content a page when looking at its layout. Be distracted by the readable content a page when looking at its layout.</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-5 w-full">
              <h1 className="text-2xl max-md:text-xl">Leave A Comment</h1>
              <div className="flex flex-col items-center gap-5 w-full px-2 py-1">
                <div className="flex flex-row items-center gap-5 w-full">
                  <div className="flex items-center justify-center">
                    <img src="https://cdn4.iconfinder.com/data/icons/general-office/91/General_Office_33-512.png" alt="logo" className="w-20 h-20 object-contain rounded-full" />
                  </div>
                  <div className="flex flex-col gap-3 items-start">
                    <div className="flex flex-row items-center gap-2">
                      <Link href={"/"} className="text-base text-slate-400 line-clamp-1">Dena Rogahn</Link>
                    </div>
                    <div className="flex flex-row items-center gap-1">
                      <p className="text-xs text-slate-400">12.05.2022</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-5 w-full">
                  <textarea className="w-full h-40 p-5 bg-gray-500/40 rounded-md" placeholder="Write your comment..." />
                </div>
                <div className="flex flex-row justify-end items-center w-full gap-5">
                  <button className="flex flex-row justify-center items-center bg-sky-500 hover:bg-sky-300 gap-2 px-2 py-1 max-mobile-xl:mr-1 rounded-md hover:text-slate-600">
                    <p className="text-lg">Submit</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
};

export default BlogId;