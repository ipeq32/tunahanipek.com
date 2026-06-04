export type MapTileTheme = 'light' | 'dark';

/** Sokak ve etiket detayı için Voyager (dark_all yerine). */
export function getMapTileUrl(_theme: MapTileTheme): string {
  return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
}

export const DEFAULT_MAP_CENTER: [number, number] = [39.9334, 32.8597];
export const DEFAULT_MAP_ZOOM = 6;
export const SELECTED_MAP_ZOOM = 16;
