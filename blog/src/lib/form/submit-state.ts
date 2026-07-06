import type { Control, FieldValues, UseFormReturn } from 'react-hook-form';
import { useFormState } from 'react-hook-form';
import type { ZodTypeAny } from 'zod';

export type FormSubmitOptions = {
  extraDisabled?: boolean;
  /** Düzenleme formlarında kaydet yalnızca değişiklik yapıldığında aktif olur */
  requireDirty?: boolean;
};

function resolveSubmitOptions(
  options?: boolean | FormSubmitOptions,
): FormSubmitOptions {
  if (typeof options === 'boolean') {
    return { extraDisabled: options };
  }

  return options ?? {};
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
  options?: boolean | FormSubmitOptions,
): boolean {
  const { extraDisabled = false, requireDirty = false } =
    resolveSubmitOptions(options);
  const { isSubmitting, isValid, isDirty } = useFormState({ control });

  return isFormSubmitDisabledState({
    isSubmitting,
    isValid,
    isDirty,
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
  options?: boolean | FormSubmitOptions,
): boolean {
  const { extraDisabled = false, requireDirty = false } =
    resolveSubmitOptions(options);
  const values = form.watch();
  const { isSubmitting, isDirty } = useFormState({ control: form.control });
  const isValid = schema.safeParse(values).success;

  return isFormSubmitDisabledState({
    isSubmitting,
    isValid,
    isDirty,
    extraDisabled,
    requireDirty,
  });
}
