type HeaderTemplateProps = {
  title: string;
  description: string;
};

const HeaderTemplate = ({ description, title }: HeaderTemplateProps) => {
  return (
    <header className="relative mb-8 mt-6 overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-8 shadow-sm backdrop-blur-sm animate-fade-in-up md:p-10">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-teal-500/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl"
        aria-hidden
      />
      <div className="relative space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400">
          Tunahan İPEK
        </p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
          {description}
        </p>
      </div>
    </header>
  );
};

export default HeaderTemplate;
