import {
  extractArray,
  fetchJson,
  logAddressUpstreamError,
} from './fetch-utils';
import type { AddressOption, SettlementType } from './types';

const TURKIYE_API_BASE = 'https://turkiyeapi.dev/api/v1';

type TurkiyeNamedEntity = {
  id: number;
  name: string;
};

type TurkiyeApiResponse<T> = {
  status?: string;
  data: T[];
};

function buildUrl(path: string, params?: Record<string, string | number>): string {
  const url = new URL(`${TURKIYE_API_BASE}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function fetchTurkiyeList<T extends TurkiyeNamedEntity>(
  path: string,
  params?: Record<string, string | number>
): Promise<T[]> {
  const payload = await fetchJson<TurkiyeApiResponse<T> | T[]>(
    buildUrl(path, params)
  );
  return extractArray<T>(payload);
}

export async function getTurkiyeProvinces(): Promise<AddressOption[]> {
  try {
    const items = await fetchTurkiyeList<TurkiyeNamedEntity>('/provinces', {
      limit: 100,
      sort: 'name',
    });
    return items.map((item) => ({
      id: String(item.id),
      label: item.name,
    }));
  } catch (error) {
    logAddressUpstreamError('TurkiyeAPI provinces', error);
    throw error;
  }
}

export async function getTurkiyeDistricts(
  provinceId: number
): Promise<AddressOption[]> {
  try {
    const items = await fetchTurkiyeList<TurkiyeNamedEntity>('/districts', {
      provinceId,
      limit: 500,
      sort: 'name',
    });
    return items.map((item) => ({
      id: String(item.id),
      label: item.name,
    }));
  } catch (error) {
    logAddressUpstreamError('TurkiyeAPI districts', error, { provinceId });
    throw error;
  }
}

export type TurkiyeSettlementOption = AddressOption & {
  settlementType: SettlementType;
};

export async function getTurkiyeSettlements(
  districtId: number,
  name?: string,
  limit = 50
): Promise<TurkiyeSettlementOption[]> {
  try {
    const baseParams: Record<string, string | number> = {
      districtId,
      limit,
      sort: 'name',
    };
    if (name && name.trim().length >= 2) {
      baseParams.name = name.trim();
    }

    const [neighborhoods, villages] = await Promise.all([
      fetchTurkiyeList<TurkiyeNamedEntity>('/neighborhoods', baseParams),
      fetchTurkiyeList<TurkiyeNamedEntity>('/villages', baseParams),
    ]);

    const neighborhoodOptions: TurkiyeSettlementOption[] = neighborhoods.map(
      (item) => ({
        id: String(item.id),
        label: item.name,
        meta: 'neighborhood',
        settlementType: 'neighborhood' as const,
      })
    );

    const villageOptions: TurkiyeSettlementOption[] = villages.map((item) => ({
      id: String(item.id),
      label: item.name,
      meta: 'village',
      settlementType: 'village' as const,
    }));

    return [...neighborhoodOptions, ...villageOptions].sort((a, b) =>
      a.label.localeCompare(b.label, 'tr')
    );
  } catch (error) {
    logAddressUpstreamError('TurkiyeAPI settlements', error, { districtId });
    throw error;
  }
}
