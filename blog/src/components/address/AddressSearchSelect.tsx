'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import type { AddressOption } from '@/lib/address/types';
import { useTranslations } from 'next-intl';
import { useDebounce } from './use-debounce';

type AddressSearchSelectProps = {
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  loadingLabel: string;
  required?: boolean;
  disabled?: boolean;
  value: string;
  displayValue?: string;
  options?: AddressOption[];
  fetchUrl?: string;
  minSearchLength?: number;
  onChange: (option: AddressOption | null) => void;
  error?: string;
  helperText?: string;
};

async function fetchOptions(url: string): Promise<AddressOption[]> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to load options');
  }
  const json = (await res.json()) as { data: AddressOption[] };
  return json.data ?? [];
}

export default function AddressSearchSelect({
  label,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  loadingLabel,
  required = false,
  disabled = false,
  value,
  displayValue,
  options: staticOptions,
  fetchUrl,
  minSearchLength = 0,
  onChange,
  error,
  helperText,
}: AddressSearchSelectProps) {
  const t = useTranslations('Address');
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [remoteOptions, setRemoteOptions] = useState<AddressOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const debouncedQuery = useDebounce(query, 300);
  const selectedLabel =
    displayValue ??
    staticOptions?.find((o) => o.id === value)?.label ??
    remoteOptions.find((o) => o.id === value)?.label;

  const loadRemote = useCallback(async () => {
    if (!fetchUrl) return;
    setLoading(true);
    setLoadError(false);
    try {
      const data = await fetchOptions(fetchUrl);
      setRemoteOptions(data);
    } catch {
      setLoadError(true);
      setRemoteOptions([]);
    } finally {
      setLoading(false);
    }
  }, [fetchUrl]);

  useEffect(() => {
    if (!fetchUrl || !open) return;

    if (minSearchLength > 0) {
      if (debouncedQuery.trim().length < minSearchLength) {
        setRemoteOptions([]);
        return;
      }
      const url = new URL(fetchUrl, window.location.origin);
      url.searchParams.set('name', debouncedQuery.trim());
      setLoading(true);
      setLoadError(false);
      fetchOptions(url.pathname + url.search)
        .then(setRemoteOptions)
        .catch(() => {
          setLoadError(true);
          setRemoteOptions([]);
        })
        .finally(() => setLoading(false));
      return;
    }

    void loadRemote();
  }, [fetchUrl, open, debouncedQuery, minSearchLength, loadRemote]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const options = staticOptions ?? remoteOptions;

  const filteredOptions = useMemo(() => {
    if (fetchUrl && minSearchLength > 0) {
      return options;
    }
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, fetchUrl, minSearchLength]);

  return (
    <div ref={containerRef} className="relative w-full space-y-1.5">
      <label className="text-xs font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>

      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 text-sm shadow-sm transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-rose-500/70'
        )}
      >
        <span
          className={cn(
            'truncate text-left',
            !selectedLabel && 'text-muted-foreground'
          )}
        >
          {selectedLabel ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 opacity-50 transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
      {error && <p className="text-xs text-rose-400">{error}</p>}

      {open && (
        <div
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg"
        >
          <div className="border-b border-border/60 p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 pl-8"
                autoFocus
              />
            </div>
          </div>

          <ul className="max-h-56 overflow-y-auto p-1">
            {loading && (
              <li className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {loadingLabel}
              </li>
            )}

            {!loading && loadError && (
              <li className="px-3 py-2 text-sm text-rose-400">{emptyLabel}</li>
            )}

            {!loading &&
              !loadError &&
              debouncedQuery.trim().length < minSearchLength &&
              minSearchLength > 0 && (
                <li className="px-3 py-2 text-sm text-muted-foreground">
                  {searchPlaceholder}
                </li>
              )}

            {!loading &&
              !loadError &&
              (minSearchLength === 0 ||
                debouncedQuery.trim().length >= minSearchLength) &&
              filteredOptions.length === 0 && (
                <li className="px-3 py-2 text-sm text-muted-foreground">
                  {emptyLabel}
                </li>
              )}

            {!loading &&
              filteredOptions.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={option.id === value}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent',
                      option.id === value && 'bg-accent/60'
                    )}
                    onClick={() => {
                      onChange(option);
                      setOpen(false);
                      setQuery('');
                    }}
                  >
                    <span className="truncate">
                      {option.label}
                      {option.meta === 'village' && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({t('villageTag')})
                        </span>
                      )}
                    </span>
                    {option.id === value && (
                      <Check className="h-4 w-4 shrink-0 text-teal-600" />
                    )}
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
