import { describe, expect, it, afterEach } from 'vitest';
import {
  ensureServerlessChromiumEnv,
  isServerlessRuntime,
  resolveChromiumBinDirectory,
  resolveRemoteChromiumPackUrl,
} from '@/lib/project-screenshots/serverless-chromium';

describe('serverless-chromium', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('detects Vercel as serverless runtime', () => {
    process.env.VERCEL = '1';
    expect(isServerlessRuntime()).toBe(true);
  });

  it('sets AWS_LAMBDA_JS_RUNTIME fallback before chromium import', () => {
    process.env.VERCEL = '1';
    delete process.env.AWS_LAMBDA_JS_RUNTIME;

    ensureServerlessChromiumEnv();

    expect(process.env.AWS_LAMBDA_JS_RUNTIME).toBe('nodejs22.x');
  });

  it('resolves local chromium bin directory when installed', () => {
    const binPath = resolveChromiumBinDirectory();
    expect(binPath).toBeTruthy();
    expect(String(binPath)).toMatch(/@sparticuz[\\/]+chromium[\\/]+bin$/);
  });

  it('resolves remote chromium pack url by architecture', () => {
    expect(resolveRemoteChromiumPackUrl()).toMatch(
      /chromium-v149\.0\.0-pack\.(x64|arm64)\.tar$/,
    );
  });
});
