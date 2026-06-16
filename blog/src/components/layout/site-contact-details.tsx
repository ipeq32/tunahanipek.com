import Link from 'next/link';
import { Globe, Mail, MapPin, Phone } from 'lucide-react';

import type { SiteOwnerProfile } from '@/lib/site-owner';
import { buildTelHref } from '@/lib/contact/display';

type SiteContactDetailsProps = {
  owner: SiteOwnerProfile;
  emailLabel: string;
  corporateEmailLabel?: string;
  phoneLabel: string;
  addressLabel: string;
  websiteLabel: string;
  className?: string;
};

export function SiteContactDetails({
  owner,
  emailLabel,
  corporateEmailLabel,
  phoneLabel,
  addressLabel,
  websiteLabel,
  className,
}: SiteContactDetailsProps) {
  const showCorporateEmail =
    owner.contactEmail &&
    owner.contactEmail.trim().toLowerCase() !== owner.email.toLowerCase();

  const items = [
    showCorporateEmail
      ? {
          key: 'corporate-email',
          label: corporateEmailLabel ?? emailLabel,
          href: `mailto:${owner.publicEmail}`,
          value: owner.publicEmail,
          icon: Mail,
          external: false,
        }
      : {
          key: 'email',
          label: emailLabel,
          href: `mailto:${owner.publicEmail}`,
          value: owner.publicEmail,
          icon: Mail,
          external: false,
        },
    showCorporateEmail
      ? {
          key: 'personal-email',
          label: emailLabel,
          href: `mailto:${owner.email}`,
          value: owner.email,
          icon: Mail,
          external: false,
        }
      : null,
    owner.phone
      ? {
          key: 'phone',
          label: phoneLabel,
          href: buildTelHref(owner.phone),
          value: owner.phone,
          icon: Phone,
          external: false,
        }
      : null,
    owner.website
      ? {
          key: 'website',
          label: websiteLabel,
          href: owner.website,
          value: owner.website.replace(/^https?:\/\//, ''),
          icon: Globe,
          external: true,
        }
      : null,
    owner.addressShort && owner.mapsHref
      ? {
          key: 'address',
          label: addressLabel,
          href: owner.mapsHref,
          value: owner.addressShort,
          icon: MapPin,
          external: true,
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    href: string;
    value: string;
    icon: typeof Mail;
    external: boolean;
  }>;

  if (items.length === 0) {
    return null;
  }

  return (
    <ul className={className ?? 'grid gap-3 sm:grid-cols-2'}>
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <li key={item.key}>
            <Link
              href={item.href}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noreferrer' : undefined}
              className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/40 p-4 text-sm transition-colors hover:border-teal-500/30 hover:bg-teal-500/5"
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </span>
                <span className="mt-0.5 block break-all text-foreground">
                  {item.value}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
