import React from "react";

type Props = {
  title: string;
  description: string;
  image?: string;
  headerImage?: string | any;
};

const HeaderTemplate = ({ description, title, image, headerImage }: Props) => {
  return (
    <section className={`flex flex-row justify-around items-center bg-[url('/header-bg.jpg')] w-full h-80 max-lg:px-10 max-lg:gap-5 max-sm:h-64 shadow-lg max-md:shadow-md max-md:shadow-violet-400 shadow-violet-400 bg-cover hue-rotate-[10deg] saturate-50 contrast-150 brightness-[.73]`}>
      <header className="flex flex-col justify-center items-center gap-5 max-lg:items-start max-sm:gap-0 brightness-200 hue-rotate-0 saturate-200 contrast-100">
        <h1 className="text-5xl max-md:text-3xl max-sm:text-2xl max-mobile-xl:text-lg">{title}</h1>
        <p className="text-lg max-md:text-sm max-sm:text-xs line-clamp-4 max-w-xl">{description}</p>
      </header>
      <figure className="flex justify-center items-center rounded-3xl">
        <img src={image} alt={title} className="w-72 h-72 max-sm:w-60 max-sm:h-60 max-mobile-xl:w-40 max-mobile-xl:h-40 object-contain rounded-3xl" />
      </figure>
    </section>
  )
};

export default HeaderTemplate;