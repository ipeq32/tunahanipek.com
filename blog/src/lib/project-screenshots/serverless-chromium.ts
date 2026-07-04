import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const CHROMIUM_VERSION = '149.0.0';

const REMOTE_CHROMIUM_PACK_URLS = {
  x64: `https://github.com/Sparticuz/chromium/releases/download/v${CHROMIUM_VERSION}/chromium-v${CHROMIUM_VERSION}-pack.x64.tar`,
  arm64: `https://github.com/Sparticuz/chromium/releases/download/v${CHROMIUM_VERSION}/chromium-v${CHROMIUM_VERSION}-pack.arm64.tar`,
} as const;

export function isServerlessRuntime(): boolean {
  return (
    process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME)
  );
}

export function ensureServerlessChromiumEnv(): void {
  if (!isServerlessRuntime()) {
    return;
  }

  if (!process.env.AWS_LAMBDA_JS_RUNTIME) {
    process.env.AWS_LAMBDA_JS_RUNTIME = 'nodejs22.x';
  }
}

export function resolveChromiumBinDirectory(): string | null {
  const candidates: string[] = [];

  for (const requireFrom of [import.meta.url, join(process.cwd(), 'package.json')]) {
    try {
      const require = createRequire(requireFrom);
      const entry = require.resolve('@sparticuz/chromium');
      candidates.push(join(dirname(entry), '..', 'bin'));
    } catch {
      // Try the next resolution root.
    }
  }

  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

export function resolveRemoteChromiumPackUrl(): string {
  const arch = process.arch === 'arm64' ? 'arm64' : 'x64';
  return REMOTE_CHROMIUM_PACK_URLS[arch];
}
