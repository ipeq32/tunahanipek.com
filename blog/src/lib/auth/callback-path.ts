const UNSAFE_CALLBACK_PATTERN = /[[\]]/;

export function isValidAuthCallbackPath(
  path: string | null | undefined,
): path is string {
  if (!path || !path.startsWith('/')) {
    return false;
  }

  return !UNSAFE_CALLBACK_PATTERN.test(path);
}

export function resolveAuthCallbackPath(
  preferred: string | null | undefined,
  fallback: string,
): string {
  if (isValidAuthCallbackPath(preferred)) {
    return preferred;
  }

  return isValidAuthCallbackPath(fallback) ? fallback : '/';
}
