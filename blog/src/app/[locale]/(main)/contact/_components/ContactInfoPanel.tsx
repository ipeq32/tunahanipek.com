import { ContactChannelCard } from '@/components/layout/contact-channel-card';
import { SiteContactDetails } from '@/components/layout/site-contact-details';
import type { SiteOwnerProfile } from '@/lib/site-owner';
import { Clock, type LucideIcon } from 'lucide-react';

type SocialChannel = {
  label: string;
  value: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
};

type ContactInfoPanelProps = {
  availabilityBadge: string;
  body: string;
  responseNote: string;
  directContactTitle: string;
  socialTitle: string;
  siteOwner: SiteOwnerProfile | null;
  corporateEmailLabel: string;
  personalEmailLabel: string;
  phoneLabel: string;
  addressLabel: string;
  websiteLabel: string;
  omitAddress?: boolean;
  channels: SocialChannel[];
};

export function ContactInfoPanel({
  availabilityBadge,
  body,
  responseNote,
  directContactTitle,
  socialTitle,
  siteOwner,
  corporateEmailLabel,
  personalEmailLabel,
  phoneLabel,
  addressLabel,
  websiteLabel,
  omitAddress = false,
  channels,
}: ContactInfoPanelProps) {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/[0.08] via-cyan-500/[0.04] to-transparent p-6 shadow-sm">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-teal-500/15 blur-2xl"
          aria-hidden
        />
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-teal-500/25 bg-teal-500/10 px-3 py-1.5 text-xs font-medium text-teal-700 dark:text-teal-300">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
            </span>
            {availabilityBadge}
          </div>
          <p className="text-sm leading-relaxed text-foreground/85">{body}</p>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0 text-teal-500" aria-hidden />
            {responseNote}
          </p>
        </div>
      </div>

      {siteOwner && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {directContactTitle}
          </h2>
          <SiteContactDetails
            owner={siteOwner}
            emailLabel={personalEmailLabel}
            corporateEmailLabel={corporateEmailLabel}
            phoneLabel={phoneLabel}
            addressLabel={addressLabel}
            websiteLabel={websiteLabel}
            className="grid gap-3"
            omitAddress={omitAddress}
          />
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {socialTitle}
        </h2>
        <div className="grid gap-3">
          {channels.map((channel) => (
            <ContactChannelCard key={channel.href} {...channel} />
          ))}
        </div>
      </section>
    </div>
  );
}
