'use client';

import { useCallback, useState } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { cloneFormValues } from '@/lib/form/form-values-equal';

export function useFormBaseline<T extends FieldValues>(form: UseFormReturn<T>) {
  const [baseline, setBaseline] = useState<T | null>(null);
  const [baselineVersion, setBaselineVersion] = useState(0);

  const captureBaseline = useCallback(() => {
    setBaseline(cloneFormValues(form.getValues()));
    setBaselineVersion((version) => version + 1);
  }, [form]);

  const syncBaselineAfterReset = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        captureBaseline();
      });
    });
  }, [captureBaseline]);

  return {
    baseline,
    baselineVersion,
    captureBaseline,
    syncBaselineAfterReset,
  };
}
