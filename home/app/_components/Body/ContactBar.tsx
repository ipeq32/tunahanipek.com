import { MailIcon } from "@/app/_ui/icons";
import { site } from "@/app/_content/site";

const ContactBar = () => {
  return (
    <section
      className="grid gap-3 sm:grid-cols-2 md:gap-2"
      aria-label="İletişim"
    >
      {site.emails.map((email) => (
        <a
          key={email.address}
          href={`mailto:${email.address}`}
          className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/70 p-3 shadow-sm backdrop-blur-sm transition hover:border-emerald-300 hover:shadow-md md:rounded-lg md:p-2.5"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-100 md:h-8 md:w-8">
            <MailIcon className="h-4 w-4 md:h-3.5 md:w-3.5" />
          </span>
          <span className="min-w-0 text-left">
            <span className="block text-[0.65rem] font-semibold uppercase tracking-wide text-slate-500 md:text-[0.6rem]">
              {email.label}
            </span>
            <span className="block truncate text-sm font-medium text-slate-800 group-hover:text-emerald-800 md:text-xs">
              {email.address}
            </span>
          </span>
        </a>
      ))}
    </section>
  );
};

export default ContactBar;
