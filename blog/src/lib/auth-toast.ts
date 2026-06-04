import { toast } from 'sonner';
import type { FieldErrors } from 'react-hook-form';

export function authToastSuccess(title: string, description?: string) {
  toast.success(title, description ? { description } : undefined);
}

export function authToastError(title: string, description?: string) {
  toast.error(title, description ? { description } : undefined);
}

type LoginFailTranslator = (key: string) => string;

export function mapSignInError(
  error: string | undefined,
  t: LoginFailTranslator
): string {
  switch (error) {
    case 'CredentialsSignin':
      return t('invalidCredentials');
    default:
      return t('description');
  }
}

function collectFirstFieldMessage(errors: unknown): string | undefined {
  if (!errors || typeof errors !== 'object') return undefined;

  const record = errors as Record<string, unknown>;
  if (typeof record.message === 'string') {
    return record.message;
  }

  for (const value of Object.values(record)) {
    const nested = collectFirstFieldMessage(value);
    if (nested) return nested;
  }

  return undefined;
}

export function firstFieldErrorMessage<TFieldValues extends Record<string, unknown>>(
  errors: FieldErrors<TFieldValues>
): string | undefined {
  return collectFirstFieldMessage(errors);
}
