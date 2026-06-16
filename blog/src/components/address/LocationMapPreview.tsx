'use client';

import { useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { getMapTileUrl, SELECTED_MAP_ZOOM } from './map-tiles';

import 'leaflet/dist/leaflet.css';

type LocationMapPreviewProps = {
  latitude: number;
  longitude: number;
  zoom?: number;
  className?: string;
};

const pinIcon = L.divIcon({
  className: 'address-map-marker-icon',
  html: `<span class="address-map-marker-pin" aria-hidden="true"></span>`,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
});

export default function LocationMapPreview({
  latitude,
  longitude,
  zoom = SELECTED_MAP_ZOOM,
  className,
}: LocationMapPreviewProps) {
  const { resolvedTheme } = useTheme();
  const tileTheme = resolvedTheme === 'dark' ? 'dark' : 'light';

  const center = useMemo<[number, number]>(
    () => [latitude, longitude],
    [latitude, longitude]
  );

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={cn(
        'address-map-container z-0 h-full w-full',
        tileTheme === 'dark' && 'address-map-container--dark',
        className
      )}
      scrollWheelZoom={false}
      attributionControl={false}
      zoomControl
    >
      <TileLayer attribution="" url={getMapTileUrl(tileTheme)} />
      <Marker position={center} icon={pinIcon} />
    </MapContainer>
  );
}
