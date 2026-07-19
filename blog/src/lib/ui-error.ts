import { logger } from '@/lib/logger';

const OMITTED_PRODUCTION_ERROR =
  'An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details.';

export function resolveDisplayErrorMessage(
  errorMessage: string | undefined,
  fallbackMessage: string,
): string {
  if (!errorMessage?.trim()) {
    return fallbackMessage;
  }

  if (
    errorMessage.includes(OMITTED_PRODUCTION_ERROR) ||
    errorMessage.includes('omitted in production builds')
  ) {
    return fallbackMessage;
  }

  return errorMessage;
}

export function logUiError(
  scope: string,
  error: Error & { digest?: string },
): void {
  logger.error(scope, {
    message: error.message,
    digest: error.digest,
  });
}
