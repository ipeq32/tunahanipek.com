import type { Control, FieldValues, UseFormReturn } from 'react-hook-form';
import { useFormState, useWatch } from 'react-hook-form';
import type { ZodTypeAny } from 'zod';
import { deepEqual } from '@/lib/form/form-values-equal';

export type FormSubmitOptions<T extends FieldValues = FieldValues> = {
  extraDisabled?: boolean;
  /** Düzenleme formlarında kaydet yalnızca değişiklik yapıldığında aktif olur */
  requireDirty?: boolean;
  /** Reset sonrası yakalanan snapshot; varsa RHF isDirty yerine kullanılır */
  baseline?: T | null;
  baselineVersion?: number;
};

function resolveSubmitOptions<T extends FieldValues>(
  options?: boolean | FormSubmitOptions<T>,
): FormSubmitOptions<T> {
  if (typeof options === 'boolean') {
    return { extraDisabled: options };
  }

  return options ?? {};
}

function resolveHasChanges<T extends FieldValues>({
  baseline,
  baselineVersion,
  values,
  isDirty,
}: {
  baseline?: T | null;
  baselineVersion?: number;
  values: T;
  isDirty: boolean;
}): boolean {
  void baselineVersion;

  if (baseline != null) {
    return !deepEqual(values, baseline);
  }

  return isDirty;
}

export function isFormSubmitDisabledState(state: {
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  extraDisabled?: boolean;
  requireDirty?: boolean;
}): boolean {
  const { isSubmitting, isValid, isDirty, extraDisabled = false, requireDirty = false } =
    state;

  if (isSubmitting || extraDisabled) {
    return true;
  }

  if (!isValid) {
    return true;
  }

  if (requireDirty && !isDirty) {
    return true;
  }

  return false;
}

/** react-hook-form `isValid` ile submit kilidi (basit formlar). */
export function useFormSubmitDisabled<T extends FieldValues>(
  control: Control<T>,
  options?: boolean | FormSubmitOptions<T>,
): boolean {
  const { extraDisabled = false, requireDirty = false, baseline, baselineVersion } =
    resolveSubmitOptions(options);
  const { isSubmitting, isValid, isDirty } = useFormState({ control });
  const values = useWatch({ control }) as T;
  const hasChanges = resolveHasChanges({
    baseline,
    baselineVersion,
    values,
    isDirty,
  });

  return isFormSubmitDisabledState({
    isSubmitting,
    isValid,
    isDirty: hasChanges,
    extraDisabled,
    requireDirty,
  });
}

/**
 * Zod şeması ile güvenilir validasyon (superRefine içeren formlar).
 * `form.watch()` ile değerleri izler; RHF `isValid` ile uyumsuzlukları önler.
 */
export function useZodFormSubmitDisabled<T extends FieldValues>(
  form: UseFormReturn<T>,
  schema: ZodTypeAny,
  options?: boolean | FormSubmitOptions<T>,
): boolean {
  const { extraDisabled = false, requireDirty = false, baseline, baselineVersion } =
    resolveSubmitOptions(options);
  const values = form.watch();
  const { isSubmitting, isDirty } = useFormState({ control: form.control });
  const isValid = schema.safeParse(values).success;
  const hasChanges = resolveHasChanges({
    baseline,
    baselineVersion,
    values,
    isDirty,
  });

  return isFormSubmitDisabledState({
    isSubmitting,
    isValid,
    isDirty: hasChanges,
    extraDisabled,
    requireDirty,
  });
}
