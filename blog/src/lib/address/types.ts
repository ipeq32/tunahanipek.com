import { z } from 'zod';

export const ADDRESS_DATA_VERSION = 1 as const;

export type SettlementType = 'neighborhood' | 'village';

export type AddressData = {
  version: typeof ADDRESS_DATA_VERSION;
  countryCode: string;
  countryName: string;
  provinceId?: number;
  provinceName?: string;
  districtId?: number;
  districtName?: string;
  neighborhoodId?: number;
  neighborhoodName?: string;
  settlementType?: SettlementType;
  stateCode?: string;
  stateName?: string;
  cityName?: string;
  street?: string;
  buildingNo?: string;
  apartment?: string;
  site?: string;
  details?: string;
  latitude?: number;
  longitude?: number;
  formattedMapAddress?: string;
};

export type AddressFormValues = {
  countryCode: string;
  countryName: string;
  provinceId: number | null;
  provinceName: string;
  districtId: number | null;
  districtName: string;
  stateCode: string;
  stateName: string;
  cityName: string;
  neighborhoodId: number | null;
  neighborhoodName: string;
  settlementType?: SettlementType;
  street: string;
  buildingNo: string;
  apartment: string;
  site: string;
  details: string;
  latitude: number | null;
  longitude: number | null;
  formattedMapAddress: string;
};

export const emptyAddressFormValues: AddressFormValues = {
  countryCode: '',
  countryName: '',
  provinceId: null,
  provinceName: '',
  districtId: null,
  districtName: '',
  stateCode: '',
  stateName: '',
  cityName: '',
  neighborhoodId: null,
  neighborhoodName: '',
  settlementType: undefined,
  street: '',
  buildingNo: '',
  apartment: '',
  site: '',
  details: '',
  latitude: null,
  longitude: null,
  formattedMapAddress: '',
};

export type AddressOption = {
  id: string;
  label: string;
  meta?: string;
};

const optionalTrimmedString = z
  .string()
  .optional()
  .transform((v) => {
    const trimmed = v?.trim();
    return trimmed ? trimmed : undefined;
  });

export const addressDataSchema = z
  .object({
    version: z.literal(ADDRESS_DATA_VERSION),
    countryCode: z.string().min(2).max(3),
    countryName: z.string().min(1),
    provinceId: z.number().int().positive().optional(),
    provinceName: optionalTrimmedString,
    districtId: z.number().int().positive().optional(),
    districtName: optionalTrimmedString,
    neighborhoodId: z.number().int().positive().optional(),
    neighborhoodName: optionalTrimmedString,
    settlementType: z.enum(['neighborhood', 'village']).optional(),
    stateCode: z.string().optional(),
    stateName: optionalTrimmedString,
    cityName: optionalTrimmedString,
    street: optionalTrimmedString,
    buildingNo: optionalTrimmedString,
    apartment: optionalTrimmedString,
    site: optionalTrimmedString,
    details: optionalTrimmedString,
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    formattedMapAddress: optionalTrimmedString,
  })
  .superRefine((data, ctx) => {
    const code = data.countryCode.toUpperCase();

    if (code === 'TR') {
      if (!data.provinceId || !data.provinceName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Province is required for Turkey',
          path: ['provinceId'],
        });
      }
      if (!data.districtId || !data.districtName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'District is required for Turkey',
          path: ['districtId'],
        });
      }
      return;
    }

    if (!data.stateCode?.trim() || !data.stateName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'State is required',
        path: ['stateCode'],
      });
    }
    if (!data.cityName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'City is required',
        path: ['cityName'],
      });
    }
  });

export function isTurkeyCountry(code: string | undefined): boolean {
  return code?.toUpperCase() === 'TR';
}

export function formValuesToAddressData(values: AddressFormValues): AddressData {
  const base: AddressData = {
    version: ADDRESS_DATA_VERSION,
    countryCode: values.countryCode.toUpperCase(),
    countryName: values.countryName.trim(),
    street: values.street.trim() || undefined,
    buildingNo: values.buildingNo.trim() || undefined,
    apartment: values.apartment.trim() || undefined,
    site: values.site.trim() || undefined,
    details: values.details.trim() || undefined,
    latitude: values.latitude ?? undefined,
    longitude: values.longitude ?? undefined,
    formattedMapAddress: values.formattedMapAddress?.trim() || undefined,
  };

  if (isTurkeyCountry(values.countryCode)) {
    return {
      ...base,
      provinceId: values.provinceId ?? undefined,
      provinceName: values.provinceName.trim() || undefined,
      districtId: values.districtId ?? undefined,
      districtName: values.districtName.trim() || undefined,
      neighborhoodId: values.neighborhoodId ?? undefined,
      neighborhoodName: values.neighborhoodName.trim() || undefined,
      settlementType: values.settlementType,
    };
  }

  return {
    ...base,
    stateCode: values.stateCode.trim() || undefined,
    stateName: values.stateName.trim() || undefined,
    cityName: values.cityName.trim() || undefined,
  };
}

export function addressDataToFormValues(
  data: AddressData | null | undefined
): AddressFormValues {
  if (!data) {
    return { ...emptyAddressFormValues };
  }

  return {
    countryCode: data.countryCode ?? '',
    countryName: data.countryName ?? '',
    provinceId: data.provinceId ?? null,
    provinceName: data.provinceName ?? '',
    districtId: data.districtId ?? null,
    districtName: data.districtName ?? '',
    stateCode: data.stateCode ?? '',
    stateName: data.stateName ?? '',
    cityName: data.cityName ?? '',
    neighborhoodId: data.neighborhoodId ?? null,
    neighborhoodName: data.neighborhoodName ?? '',
    settlementType: data.settlementType,
    street: data.street ?? '',
    buildingNo: data.buildingNo ?? '',
    apartment: data.apartment ?? '',
    site: data.site ?? '',
    details: data.details ?? '',
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    formattedMapAddress: data.formattedMapAddress ?? '',
  };
}

export function parseAddressDataJson(value: unknown): AddressData | null {
  const parsed = addressDataSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export const addressFormValuesSchema = z
  .object({
    countryCode: z.string().min(2, 'Country is required'),
    countryName: z.string().min(1, 'Country is required'),
    provinceId: z.number().nullable(),
    provinceName: z.string(),
    districtId: z.number().nullable(),
    districtName: z.string(),
    stateCode: z.string(),
    stateName: z.string(),
    cityName: z.string(),
    neighborhoodId: z.number().nullable(),
    neighborhoodName: z.string(),
    settlementType: z.enum(['neighborhood', 'village']).optional(),
    street: z.string(),
    buildingNo: z.string(),
    apartment: z.string(),
    site: z.string(),
    details: z.string(),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
    formattedMapAddress: z.string(),
  })
  .superRefine((values, ctx) => {
    if (!isTurkeyCountry(values.countryCode)) {
      if (!values.stateCode.trim() || !values.stateName.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['stateCode'],
        });
      }
      if (!values.cityName.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cityName'],
        });
      }
      return;
    }

    if (values.provinceId == null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['provinceId'] });
    }
    if (values.districtId == null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['districtId'] });
    }
  });
