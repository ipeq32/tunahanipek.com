import { useEffect } from 'react';
import type { Control, FieldValues, UseFormReturn } from 'react-hook-form';
import { useFormState } from 'react-hook-form';

/** Submit butonu devre dışı mı? (gönderim + geçersiz form + ek koşullar) */
export function useFormSubmitDisabled<T extends FieldValues>(
  control: Control<T>,
  extraDisabled = false,
): boolean {
  const { isSubmitting, isValid } = useFormState({ control });
  return isSubmitting || !isValid || extraDisabled;
}

/**
 * Reset veya önceden doldurulmuş formlarda `isValid` başlangıçta false kalır.
 * Düzenleme sayfalarında submit'in doğru durumda olması için mount sonrası tetikler.
 */
export function useTriggerInitialValidation<T extends FieldValues>(
  form: UseFormReturn<T>,
  enabled = true,
  deps: readonly unknown[] = [],
): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    void form.trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller-controlled deps
  }, [form, enabled, ...deps]);
}
