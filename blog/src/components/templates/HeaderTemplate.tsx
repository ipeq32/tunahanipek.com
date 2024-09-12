type HeaderTemplateProps = {
  title: string;
  description: string;
};

const HeaderTemplate = ({ description, title }: HeaderTemplateProps) => {
  return (
    <header className="flex flex-col justify-center items-center gap-5 max-lg:items-start max-sm:gap-0 rounded shadow-md shadow-emerald-800/40 p-4 mt-3">
      <h1 className="text-4xl max-md:text-2xl font-semibold max-w-xl">
        {title}
      </h1>
      <p className="text-lg max-md:text-xs line-clamp-2 truncate max-w-xl">
        {description}
      </p>
    </header>
  );
};

export default HeaderTemplate;
