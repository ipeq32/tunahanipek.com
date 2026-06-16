'use client';

import dynamic from 'next/dynamic';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { APPROXIMATE_MAP_ZOOM, SELECTED_MAP_ZOOM } from '@/components/address/map-tiles';

const LocationMapPreview = dynamic(
  () => import('@/components/address/LocationMapPreview'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse bg-muted/60" aria-hidden />
    ),
  }
);

type ContactLocationSectionProps = {
  latitude: number;
  longitude: number;
  addressLabel: string;
  mapsHref: string;
  mapTitle: string;
  openInMapsLabel: string;
  approximateNote?: string;
  approximate?: boolean;
  className?: string;
};

export function ContactLocationSection({
  latitude,
  longitude,
  addressLabel,
  mapsHref,
  mapTitle,
  openInMapsLabel,
  approximateNote,
  approximate = false,
  className,
}: ContactLocationSectionProps) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm',
        className
      )}
    >
      <div className="flex flex-col gap-3 border-b border-border/50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 ring-1 ring-teal-500/15 dark:text-teal-400">
            <MapPin className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 space-y-0.5">
            <h2 className="text-sm font-semibold tracking-tight">{mapTitle}</h2>
            <p className="text-sm text-muted-foreground">{addressLabel}</p>
            {approximate && approximateNote && (
              <p className="text-xs text-muted-foreground/80">{approximateNote}</p>
            )}
          </div>
        </div>
        <a
          href={mapsHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-teal-500/30 hover:bg-teal-500/[0.04] hover:text-teal-600 dark:hover:text-teal-400 sm:self-center"
        >
          {openInMapsLabel}
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>

      <div className="relative h-[220px] sm:h-[280px] md:h-[320px]">
        <LocationMapPreview
          latitude={latitude}
          longitude={longitude}
          zoom={approximate ? APPROXIMATE_MAP_ZOOM : SELECTED_MAP_ZOOM}
        />
      </div>
    </section>
  );
}
