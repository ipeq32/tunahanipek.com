import { Search } from "lucide-react";
import SidebarClient from "./SidebarClient";
import { IBlogSideBarCategories, IBlogSideBarRecentPosts, IBlogSideBarTags, IBlogsWithDetails } from "@type/BlogTypes";

type Props = {
  id?: string;
  userData?: Pick<IBlogsWithDetails, "user"> | null;
}

const Sidebar: React.FC<Props> = ({ id, userData }) => {

  const categories: IBlogSideBarCategories[] = [
    { name: 'All', count: 70 },
    { name: 'React', count: 15 },
    { name: 'Next', count: 8 },
    { name: 'Tailwind', count: 16 },
    { name: 'React Native', count: 11 },
    { name: 'Flutter', count: 9 },
  ];

  const recentPosts: IBlogSideBarRecentPosts[] = [
    { title: 'They Are Destroying The Podcast Episode With Rachel Andrews.', image: 'https://cdn1.iconfinder.com/data/icons/logotypes/32/windows-512.png', date: '2021-10-10' },
    { title: 'Responsive Web And Desktop Developer.', image: 'https://cdn4.iconfinder.com/data/icons/general-office/91/General_Office_33-512.png', date: '2021-10-10' },
    { title: 'The Company Has Launched A Joint Venture With Three Tower.', image: 'https://cdn3.iconfinder.com/data/icons/logos-brands-3/24/logo_brand_brands_logos_ubuntu-512.png', date: '2021-10-10' },
    { title: 'We Will Design Space And Make You Fall In Love With Work Again.', image: 'https://cdn4.iconfinder.com/data/icons/general-office/91/General_Office_33-512.png', date: '2021-10-10' },
    { title: 'We Started Business For Hand In Hand With Our Technology.', image: 'https://cdn1.iconfinder.com/data/icons/logotypes/32/windows-512.png', date: '2021-10-10' },
    { title: 'They Are Destroying The Podcast Episode With Rachel Andrews.', image: 'https://cdn1.iconfinder.com/data/icons/logotypes/32/windows-512.png', date: '2021-10-10' },
    { title: 'Responsive Web And Desktop Developer.', image: 'https://cdn4.iconfinder.com/data/icons/general-office/91/General_Office_33-512.png', date: '2021-10-10' },
  ];

  const tags: IBlogSideBarTags[] = [
    { name: 'All' },
    { name: 'React' },
    { name: 'Next' },
    { name: 'Tailwind' },
    { name: 'React Native' },
    { name: 'Flutter' },
  ];

  return (
    <>
      <aside className="flex flex-col gap-20 w-96 h-max px-4 py-10 border-l border-slate-500 rounded-md max-md:hidden">
        <section className="flex flex-col items-center w-full gap-5">
          <header className="flex flex-col gap-3 w-full">
            <h2 className="text-2xl">Search Here</h2>
            <span className="h-1 bg-slate-400" />
          </header>
          <div className="relative group/search flex justify-center items-center w-full">
            <input type="text" className="w-full h-10 px-4 py-2 text-slate-300 placeholder-slate-500 border border-slate-500 bg-violet-800 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent pr-10" placeholder="Search post" />
            <figure className="absolute right-0 top-0 w-10 h-10 flex justify-center items-center rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent pointer-events-none select-none">
              <Search className="text-slate-500 group-hover/search:text-slate-400 group-hover/search:scale-110" />
            </figure>
          </div>
        </section>
        <section className="relative flex flex-col items-center w-full gap-5 max-h-64 overflow-y-scroll">
          <header className="flex flex-col gap-3 w-full sticky top-0 z-[11] bg-primary">
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
        <section className="flex flex-col items-center w-full gap-5 max-h-96 overflow-y-scroll">
          <header className="flex flex-col gap-3 w-full sticky top-0 z-[11] bg-primary">
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
          <header className="flex flex-col gap-3 w-full sticky top-0 z-[11] bg-primary">
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
      </aside >
      <SidebarClient id={id} userData={userData} categories={categories} recentPosts={recentPosts} tags={tags} />
    </>
  )
};

export default Sidebar;