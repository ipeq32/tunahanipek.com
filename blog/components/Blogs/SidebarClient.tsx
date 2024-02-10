'use client'

import { SquareDashedBottom, XSquare, Search } from "lucide-react";
import React from "react";
import { blog as blogAtom } from "@jotai/atoms";
import { useAtom } from "jotai";
import { IBlogSideBarCategories, IBlogSideBarRecentPosts, IBlogSideBarTags, IBlogsWithDetails } from "@type/BlogTypes";

type Props = {
  tags: IBlogSideBarTags[];
  categories: IBlogSideBarCategories[];
  recentPosts: IBlogSideBarRecentPosts[];
  id?: string;
  userData: Pick<IBlogsWithDetails, "user"> | null | undefined;
};

const SidebarClient = ({ categories, recentPosts, tags, id, userData }: Props) => {
  const [isMenuOpen, setIsMenuOpen] = useAtom(blogAtom.blogSidebarOpenAtom);

  return (
    <aside className="w-full md:hidden -mt-10 mb-5">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl tracking-widest">{userData ? `${userData.user?.firstName?.split(" ")[0]}'s BLOG` : 'ALL BLOGS'}</h2>
        <SquareDashedBottom onClick={() => setIsMenuOpen(!isMenuOpen)} width={40} height={40} className="cursor-pointer select-none" />
      </header>
      <div className={`absolute z-40 inset-0 flex flex-col gap-14 p-5 w-full h-max ${isMenuOpen ? "block" : "hidden"} bg-primary`}>
        <div className="flex justify-end w-full -mb-8 sticky top-28 backdrop-blur-md z-[9999]">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="group/close">
            <XSquare width={40} height={40} className="text-rose-300 group-hover/close:text-rose-600 group-hover/close:scale-110" />
          </button>
        </div>
        <section className="flex flex-col items-center w-full gap-5">
          <header className="flex flex-col gap-3 w-full">
            <h2 className="text-2xl">Search Here</h2>
            <span className="h-1 bg-slate-400" />
          </header>
          <div className="relative group/search flex justify-center items-center w-full">
            <input type="text" className="w-full h-10 px-4 py-2 text-slate-300 placeholder-slate-500 border border-slate-500 bg-violet-800 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent pr-10" placeholder="Search blogs..." />
            <figure className="absolute right-0 top-0 w-10 h-10 flex justify-center items-center rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent pointer-events-none select-none">
              <Search className="text-slate-500 group-hover/search:text-slate-400 group-hover/search:scale-110" />
            </figure>
          </div>
        </section>
        <section className="relative flex flex-col items-center w-full gap-5 max-h-64 overflow-y-scroll scroll-smooth">
          <header className="flex flex-col gap-3 w-full sticky backdrop-blur-lg top-0 z-[11] bg-primary">
            <h2 className="text-2xl">Categories</h2>
            <span className="h-1 bg-slate-400" />
          </header>
          <ul className="flex flex-col gap-2 w-full">
            {categories.map((category, index) => (
              <li key={index} className="relative group/category flex justify-between items-center w-full cursor-pointer p-1">
                <span className="absolute bg-emerald-600 top-1/2 left-0 translate-y-[-50%] w-0 h-full group-hover/category:w-full rounded-md transition-all duration-300 ease-linear" />
                <span className="text-slate-300 block z-10">{category.name}</span>
                <span className="text-slate-300 block z-10">{category.count}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="flex flex-col items-center w-full gap-5 max-h-96 overflow-y-scroll scroll-smooth">
          <header className="flex flex-col gap-3 w-full sticky backdrop-blur-lg top-0 z-[11] bg-primary">
            <h2 className="text-2xl">Recent Posts</h2>
            <span className="h-1 bg-slate-400" />
          </header>
          <ul className="flex flex-col gap-2 w-full">
            {recentPosts.map((post, index) => (
              <li key={index} className="flex justify-between items-center w-full cursor-pointer p-1 gap-2 group/recent hover:bg-slate-600 rounded-md">
                <figure className="w-10 h-10">
                  <img src={post.image} alt={post.title} className="w-full h-full rounded-md object-cover" />
                </figure>
                <header className="flex flex-col items-end gap-1 w-full">
                  <h3 className="text-slate-300 text-sm line-clamp-2">{post.title}</h3>
                  <span className="text-slate-400 text-xs">{post.date}</span>
                </header>
              </li>
            ))}
          </ul>
        </section>
        <section className="flex flex-col items-center w-full gap-5 max-h-40 overflow-y-scroll">
          <header className="flex flex-col gap-3 w-full sticky backdrop-blur-lg top-0 z-[11] bg-primary">
            <h2 className="text-2xl">Tags</h2>
            <span className="h-1 bg-slate-400" />
          </header>
          <ul className="flex flex-wrap gap-2 w-full">
            {tags.map((tag, index) => (
              <li key={index} className="flex justify-center items-center cursor-pointer p-1 gap-2 group/tag hover:bg-slate-600 rounded-md">
                <span className="text-slate-300 text-sm">{tag.name}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  )
};

export default SidebarClient;