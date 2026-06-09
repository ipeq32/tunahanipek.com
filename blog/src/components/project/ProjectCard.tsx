import BlogImage from '@/components/blog/BlogImage';
import { Link } from '@/navigation';
import type { ProjectDto } from '@/lib/project-mapper';
import { stripHtmlText } from '@/lib/translation-form-utils';
import { ArrowUpRight } from 'lucide-react';

type ProjectCardProps = {
  project: ProjectDto;
  visitLabel: string;
};

export default function ProjectCard({ project, visitLabel }: ProjectCardProps) {
  return (
    <Link
      href={{ pathname: '/project/[id]', params: { id: project.id } }}
      className="block h-full"
    >
      <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/10">
        <div className="relative aspect-[16/10] overflow-hidden">
          <BlogImage
            src={project.image}
            alt={project.title}
            width={640}
            height={400}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          {project.url && (
            <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-900 opacity-0 shadow-lg transition-all group-hover:opacity-100">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-5">
          <h3 className="text-lg font-semibold leading-snug tracking-tight group-hover:text-teal-600 dark:group-hover:text-teal-400">
            {project.title}
          </h3>
          <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">
            {stripHtmlText(project.description)}
          </p>
          {project.url && (
            <span className="mt-1 inline-flex items-center text-sm font-medium text-teal-600 dark:text-teal-400">
              {visitLabel}
              <ArrowUpRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}
