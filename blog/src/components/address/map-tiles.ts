export type MapTileTheme = 'light' | 'dark';

/** Light: Voyager; dark: Carto dark tiles. */
export function getMapTileUrl(theme: MapTileTheme): string {
  if (theme === 'dark') {
    return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  }

  return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
}

export const DEFAULT_MAP_CENTER: [number, number] = [39.9334, 32.8597];
export const DEFAULT_MAP_ZOOM = 6;
export const SELECTED_MAP_ZOOM = 16;
