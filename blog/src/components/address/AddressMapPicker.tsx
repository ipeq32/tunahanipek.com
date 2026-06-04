'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
} from 'react';
import L from 'leaflet';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { Loader2, MapPin, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { GeocodeResult } from '@/lib/address/nominatim';
import type { AddressFormValues } from '@/lib/address/types';
import { useDebounce } from './use-debounce';
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  getMapTileUrl,
  SELECTED_MAP_ZOOM,
} from './map-tiles';

import 'leaflet/dist/leaflet.css';

type MapPosition = {
  lat: number;
  lon: number;
};

type AddressMapPickerProps = {
  initialLat?: number | null;
  initialLon?: number | null;
  initialLabel?: string;
  onConfirm: (patch: Partial<AddressFormValues>) => void;
  onCancel: () => void;
};

const pinIcon = L.divIcon({
  className: 'address-map-marker-icon',
  html: `<span class="address-map-marker-pin" aria-hidden="true"></span>`,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
});

function MapViewSync({
  position,
  zoom,
}: {
  position: MapPosition | null;
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!position) return;
    map.flyTo([position.lat, position.lon], zoom, { duration: 0.6 });
  }, [map, position, zoom]);

  return null;
}

function MapClickHandler({
  onPositionPick,
}: {
  onPositionPick: (lat: number, lon: number) => void;
}) {
  useMapEvents({
    click(event) {
      onPositionPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

async function fetchGeocodeSuggestions(
  query: string
): Promise<GeocodeResult[]> {
  const res = await fetch(
    `/api/address/geocode?q=${encodeURIComponent(query)}`
  );
  if (!res.ok) return [];
  const json = (await res.json()) as { data: GeocodeResult[] };
  return json.data ?? [];
}

async function fetchReverseGeocode(
  lat: number,
  lon: number
): Promise<GeocodeResult | null> {
  const res = await fetch(
    `/api/address/reverse?lat=${lat}&lon=${lon}`
  );
  if (!res.ok) return null;
  const json = (await res.json()) as { data: GeocodeResult };
  return json.data ?? null;
}

async function fetchMapResolve(
  lat: number,
  lon: number
): Promise<Partial<AddressFormValues>> {
  const res = await fetch('/api/address/map-resolve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lon }),
  });
  if (!res.ok) {
    throw new Error('resolve failed');
  }
  const json = (await res.json()) as { data: Partial<AddressFormValues> };
  return json.data;
}

export default function AddressMapPicker({
  initialLat,
  initialLon,
  initialLabel = '',
  onConfirm,
  onCancel,
}: AddressMapPickerProps) {
  const t = useTranslations('Address.map');
  const { resolvedTheme } = useTheme();
  const tileTheme = resolvedTheme === 'dark' ? 'dark' : 'light';

  const [query, setQuery] = useState(initialLabel);
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [position, setPosition] = useState<MapPosition | null>(
    initialLat != null && initialLon != null
      ? { lat: initialLat, lon: initialLon }
      : null
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [reverseLoading, setReverseLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState(false);

  const debouncedQuery = useDebounce(query, 400);

  const mapCenter = useMemo<[number, number]>(() => {
    if (position) return [position.lat, position.lon];
    return DEFAULT_MAP_CENTER;
  }, [position]);

  const mapZoom = position ? SELECTED_MAP_ZOOM : DEFAULT_MAP_ZOOM;

  const applyGeocodeResult = useCallback((result: GeocodeResult) => {
    setPosition({ lat: result.lat, lon: result.lon });
    setQuery(result.displayName);
    setSuggestionsOpen(false);
    setResolveError(false);
  }, []);

  const pickPosition = useCallback(
    async (lat: number, lon: number) => {
      setPosition({ lat, lon });
      setReverseLoading(true);
      setResolveError(false);
      try {
        const reversed = await fetchReverseGeocode(lat, lon);
        if (reversed) {
          setQuery(reversed.displayName);
        }
      } catch {
        setResolveError(true);
      } finally {
        setReverseLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);

    void fetchGeocodeSuggestions(debouncedQuery)
      .then((results) => {
        if (!cancelled) {
          setSuggestions(results);
          setSuggestionsOpen(results.length > 0);
        }
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const handleClear = () => {
    setQuery('');
    setPosition(null);
    setSuggestions([]);
    setSuggestionsOpen(false);
    setResolveError(false);
  };

  const handleConfirm = async () => {
    if (!position) return;
    setResolving(true);
    setResolveError(false);
    try {
      const patch = await fetchMapResolve(position.lat, position.lon);
      onConfirm(patch);
    } catch {
      setResolveError(true);
    } finally {
      setResolving(false);
    }
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && suggestions[0]) {
      event.preventDefault();
      applyGeocodeResult(suggestions[0]);
    }
  };

  const busy = searchLoading || reverseLoading || resolving;
  const canConfirm = Boolean(position) && !busy;
  const showSuggestions =
    suggestionsOpen && suggestions.length > 0 && !searchLoading;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 space-y-2 px-4 py-3 sm:px-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSuggestionsOpen(true);
            }}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => suggestions.length > 0 && setSuggestionsOpen(true)}
            placeholder={t('searchPlaceholder')}
            className="h-10 pl-9 pr-10"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={t('clear')}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {searchLoading && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {t('loading')}
          </p>
        )}

        {!searchLoading &&
          debouncedQuery.length >= 2 &&
          suggestions.length === 0 && (
            <p className="text-xs text-muted-foreground">{t('noResults')}</p>
          )}

        {resolveError && (
          <p className="text-xs text-rose-400">{t('resolveError')}</p>
        )}
      </div>

      <div className="relative min-h-0 flex-1 px-4 pb-3 sm:px-5">
        <div className="relative h-[240px] overflow-hidden rounded-lg border border-border sm:h-[300px]">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            className={cn(
              'address-map-container z-0 h-full w-full',
              tileTheme === 'dark' && 'address-map-container--dark'
            )}
            scrollWheelZoom
            attributionControl={false}
            zoomControl
          >
            <TileLayer attribution="" url={getMapTileUrl(tileTheme)} />
            <MapViewSync position={position} zoom={SELECTED_MAP_ZOOM} />
            <MapClickHandler onPositionPick={pickPosition} />
            {position && (
              <Marker
                position={[position.lat, position.lon]}
                icon={pinIcon}
                draggable
                eventHandlers={{
                  dragend: (event) => {
                    const marker = event.target;
                    const latlng = marker.getLatLng();
                    void pickPosition(latlng.lat, latlng.lng);
                  },
                }}
              />
            )}
          </MapContainer>

          {showSuggestions && (
            <ul className="absolute left-2 right-2 top-2 z-[1000] max-h-36 overflow-y-auto rounded-lg border border-border bg-popover/95 p-1 shadow-lg backdrop-blur-sm">
              {suggestions.map((item) => (
                <li key={item.placeId}>
                  <button
                    type="button"
                    className="w-full rounded-md px-2.5 py-2 text-left text-xs leading-snug hover:bg-accent"
                    onClick={() => applyGeocodeResult(item)}
                  >
                    {item.displayName}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!position && !busy && (
            <p className="pointer-events-none absolute bottom-3 left-1/2 z-[500] max-w-[90%] -translate-x-1/2 rounded-md bg-background/80 px-3 py-1.5 text-center text-[11px] text-muted-foreground backdrop-blur-sm">
              {t('dragHint')}
            </p>
          )}

          {(reverseLoading || resolving) && (
            <div className="absolute inset-0 z-[600] flex items-center justify-center bg-background/40 backdrop-blur-[1px]">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-600" />
                {resolving ? t('resolving') : t('loading')}
              </div>
            </div>
          )}
        </div>

        {position && query && (
          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">
              {t('previewLabel')}:
            </span>{' '}
            {query}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border/60 px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={resolving}
        >
          {t('cancel')}
        </Button>
        <Button
          type="button"
          variant="accent"
          size="sm"
          onClick={() => void handleConfirm()}
          disabled={!canConfirm}
          className={cn(!canConfirm && 'opacity-60')}
        >
          {resolving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <MapPin className="mr-2 h-4 w-4" />
          {t('confirm')}
        </Button>
      </div>
    </div>
  );
}
