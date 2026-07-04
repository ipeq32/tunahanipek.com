export function isBrowserUnavailableError(message: string): boolean {
  return /Executable doesn't exist|browserType\.launch|browsers\.json|does not exist|shared libraries|libnss|libnspr|chromium|playwright-core|Failed to load external module/i.test(
    message,
  );
}

export const BROWSER_UNAVAILABLE_MESSAGE =
  'Screenshot browser is unavailable in this environment. Redeploy after the latest changes. On Vercel: disable Fluid Compute, set AWS_LAMBDA_JS_RUNTIME=nodejs22.x, and ensure @sparticuz/chromium is bundled.';
