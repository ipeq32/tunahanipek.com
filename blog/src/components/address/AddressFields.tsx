'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Control,
  FieldPath,
  FieldValues,
  useController,
} from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FormControl, FormItem, FormLabel } from '@/components/ui/form';
import AddressSearchSelect from './AddressSearchSelect';
import {
  emptyAddressFormValues,
  isTurkeyCountry,
  type AddressFormValues,
  type AddressOption,
} from '@/lib/address/types';
import type { TurkiyeSettlementOption } from '@/lib/address/turkiye-api';

type AddressFieldsProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  disabled?: boolean;
  variant?: 'register' | 'settings';
  showSectionHeader?: boolean;
};

async function loadOptions(url: string): Promise<AddressOption[]> {
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = (await res.json()) as { data: AddressOption[] };
  return json.data ?? [];
}

export default function AddressFields<T extends FieldValues>({
  control,
  name,
  disabled = false,
  variant = 'register',
  showSectionHeader = variant === 'settings',
}: AddressFieldsProps<T>) {
  const t = useTranslations('Address');
  const { field, fieldState } = useController({
    control,
    name,
  });

  const value = (field.value as AddressFormValues | undefined) ?? {
    ...emptyAddressFormValues,
  };

  const setValue = useCallback(
    (patch: Partial<AddressFormValues>) => {
      field.onChange({ ...value, ...patch });
    },
    [field, value]
  );

  const countryCode = value.countryCode;
  const isTurkey = isTurkeyCountry(countryCode);
  const hasCountry = Boolean(countryCode);
  const hasProvince = value.provinceId != null;
  const hasDistrict = value.districtId != null;
  const hasState = Boolean(value.stateCode?.trim());
  const hasCity = Boolean(value.cityName?.trim());
  const adminComplete = isTurkey
    ? hasCountry && hasProvince && hasDistrict
    : hasCountry && hasState && hasCity;

  const [countries, setCountries] = useState<AddressOption[]>([]);
  const [provinces, setProvinces] = useState<AddressOption[]>([]);
  const [districts, setDistricts] = useState<AddressOption[]>([]);
  const [states, setStates] = useState<AddressOption[]>([]);

  useEffect(() => {
    void loadOptions('/api/address/geo/countries').then(setCountries);
  }, []);

  useEffect(() => {
    if (!isTurkey) {
      setProvinces([]);
      setDistricts([]);
      return;
    }
    void loadOptions('/api/address/tr/provinces').then(setProvinces);
  }, [isTurkey]);

  useEffect(() => {
    if (!isTurkey || value.provinceId == null) {
      setDistricts([]);
      return;
    }
    void loadOptions(
      `/api/address/tr/districts?provinceId=${value.provinceId}`
    ).then(setDistricts);
  }, [isTurkey, value.provinceId]);

  useEffect(() => {
    if (isTurkey || !countryCode) {
      setStates([]);
      return;
    }
    void loadOptions(
      `/api/address/geo/states?countryCode=${encodeURIComponent(countryCode)}`
    ).then(setStates);
  }, [isTurkey, countryCode]);

  const resetBelowProvince = useCallback(() => {
    setValue({
      districtId: null,
      districtName: '',
      neighborhoodId: null,
      neighborhoodName: '',
      settlementType: undefined,
    });
  }, [setValue]);

  const resetBelowState = useCallback(() => {
    setValue({ cityName: '' });
  }, [setValue]);

  const labelClass =
    variant === 'register' ? 'text-xs text-foreground' : undefined;

  const fieldError = fieldState.error?.message;

  const renderDetailInput = (
    key: keyof Pick<
      AddressFormValues,
      'street' | 'buildingNo' | 'apartment' | 'site' | 'details'
    >,
    label: string,
    placeholder: string
  ) => (
    <FormItem>
      <FormLabel className={labelClass}>{label}</FormLabel>
      <FormControl>
        <Input
          disabled={disabled}
          placeholder={placeholder}
          value={value[key]}
          onChange={(e) => setValue({ [key]: e.target.value })}
        />
      </FormControl>
    </FormItem>
  );

  return (
    <div className="space-y-4">
      {showSectionHeader && (
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-300">
            <MapPin className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold">{t('sectionTitle')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('sectionDescription')}
            </p>
          </div>
        </div>
      )}

      <AddressSearchSelect
        label={t('country')}
        placeholder={t('countryPlaceholder')}
        searchPlaceholder={t('searchPlaceholder')}
        emptyLabel={t('empty')}
        loadingLabel={t('loading')}
        required
        disabled={disabled}
        value={value.countryCode}
        displayValue={value.countryName || undefined}
        options={countries}
        onChange={(option) => {
          if (!option) return;
          setValue({
            ...emptyAddressFormValues,
            countryCode: option.id,
            countryName: option.label,
          });
        }}
        error={
          fieldState.error?.message &&
          !value.countryCode &&
          fieldError
            ? fieldError
            : undefined
        }
      />

      <AnimatePresence initial={false}>
        {hasCountry && isTurkey && (
          <motion.div
            key="tr-admin"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid gap-4 overflow-hidden sm:grid-cols-2"
          >
            <AddressSearchSelect
              label={t('province')}
              placeholder={t('provincePlaceholder')}
              searchPlaceholder={t('searchPlaceholder')}
              emptyLabel={t('empty')}
              loadingLabel={t('loading')}
              required
              disabled={disabled}
              value={value.provinceId != null ? String(value.provinceId) : ''}
              displayValue={value.provinceName || undefined}
              options={provinces}
              onChange={(option) => {
                if (!option) return;
                resetBelowProvince();
                setValue({
                  provinceId: Number(option.id),
                  provinceName: option.label,
                  districtId: null,
                  districtName: '',
                  neighborhoodId: null,
                  neighborhoodName: '',
                });
              }}
            />

            {hasProvince && (
              <AddressSearchSelect
                label={t('district')}
                placeholder={t('districtPlaceholder')}
                searchPlaceholder={t('searchPlaceholder')}
                emptyLabel={t('empty')}
                loadingLabel={t('loading')}
                required
                disabled={disabled}
                value={
                  value.districtId != null ? String(value.districtId) : ''
                }
                displayValue={value.districtName || undefined}
                options={districts}
                onChange={(option) => {
                  if (!option) return;
                  setValue({
                    districtId: Number(option.id),
                    districtName: option.label,
                    neighborhoodId: null,
                    neighborhoodName: '',
                    settlementType: undefined,
                  });
                }}
              />
            )}
          </motion.div>
        )}

        {hasCountry && !isTurkey && (
          <motion.div
            key="global-admin"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid gap-4 overflow-hidden sm:grid-cols-2"
          >
            <AddressSearchSelect
              label={t('state')}
              placeholder={t('statePlaceholder')}
              searchPlaceholder={t('searchPlaceholder')}
              emptyLabel={t('empty')}
              loadingLabel={t('loading')}
              required
              disabled={disabled}
              value={value.stateCode}
              displayValue={value.stateName || undefined}
              options={states}
              helperText={!hasCountry ? t('selectCountryFirst') : undefined}
              onChange={(option) => {
                if (!option) return;
                resetBelowState();
                setValue({
                  stateCode: option.id,
                  stateName: option.label,
                  cityName: '',
                });
              }}
            />

            {hasState && (
              <AddressSearchSelect
                label={t('city')}
                placeholder={t('cityPlaceholder')}
                searchPlaceholder={t('citySearchMin')}
                emptyLabel={t('empty')}
                loadingLabel={t('loading')}
                required
                disabled={disabled}
                value={value.cityName}
                displayValue={value.cityName || undefined}
                fetchUrl={`/api/address/geo/cities?countryCode=${encodeURIComponent(countryCode)}&stateCode=${encodeURIComponent(value.stateCode)}`}
                minSearchLength={2}
                onChange={(option) => {
                  if (!option) return;
                  setValue({ cityName: option.label });
                }}
              />
            )}
          </motion.div>
        )}

        {hasCountry && isTurkey && hasDistrict && (
          <motion.div
            key="tr-settlement"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <AddressSearchSelect
              label={t('neighborhood')}
              placeholder={t('neighborhoodPlaceholder')}
              searchPlaceholder={t('neighborhoodSearchMin')}
              emptyLabel={t('empty')}
              loadingLabel={t('loading')}
              disabled={disabled}
              value={
                value.neighborhoodId != null
                  ? String(value.neighborhoodId)
                  : ''
              }
              displayValue={value.neighborhoodName || undefined}
              fetchUrl={`/api/address/tr/neighborhoods?districtId=${value.districtId}`}
              minSearchLength={2}
              onChange={(option) => {
                if (!option) {
                  setValue({
                    neighborhoodId: null,
                    neighborhoodName: '',
                    settlementType: undefined,
                  });
                  return;
                }
                const settlement = option as TurkiyeSettlementOption;
                setValue({
                  neighborhoodId: Number(option.id),
                  neighborhoodName: option.label,
                  settlementType: settlement.settlementType,
                });
              }}
            />
          </motion.div>
        )}

        {adminComplete && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 border-t border-border/40 pt-4"
          >
            <p className="text-xs font-medium text-muted-foreground">
              {t('detailsSection')}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {renderDetailInput(
                'site',
                t('site'),
                t('sitePlaceholder')
              )}
              {renderDetailInput(
                'street',
                t('street'),
                t('streetPlaceholder')
              )}
              {renderDetailInput(
                'buildingNo',
                t('building'),
                t('buildingPlaceholder')
              )}
              {renderDetailInput(
                'apartment',
                t('apartment'),
                t('apartmentPlaceholder')
              )}
            </div>
            {renderDetailInput(
              'details',
              t('extra'),
              t('extraPlaceholder')
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {fieldError && (
        <p className="text-xs text-rose-400" role="alert">
          {fieldError}
        </p>
      )}
    </div>
  );
}
