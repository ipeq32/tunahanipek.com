import Link from "next/link";
import {
  ArrowUpRightIcon,
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  MessageCircleIcon,
  MusicIcon,
} from "@/app/_ui/icons";
import { site } from "@/app/_content/site";

const iconMap = {
  instagram: InstagramIcon,
  github: GithubIcon,
  linkedin: LinkedinIcon,
  "message-circle": MessageCircleIcon,
  music: MusicIcon,
} as const;

const SiteFooter = () => {
  return (
    <footer className="flex flex-col items-center gap-6 border-t border-slate-200/80 pt-8 pb-4 sm:flex-row sm:justify-between md:gap-4 md:pt-4 md:pb-0">
      <div className="flex flex-wrap justify-center gap-2">
        {site.social.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <Link
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.name}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 hover:shadow-sm md:h-9 md:w-9"
            >
              <Icon className="h-4 w-4 md:h-3.5 md:w-3.5" />
            </Link>
          );
        })}
      </div>

      <Link
        href={site.blogUrl}
        className="group inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800 md:px-4 md:py-2 md:text-xs"
      >
        Bloga git
        <ArrowUpRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 md:h-3.5 md:w-3.5" />
      </Link>
    </footer>
  );
};

export default SiteFooter;
