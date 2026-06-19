import 'server-only';

import { generateGeminiVisionJson } from '@/lib/ai/vision/gemini-vision';
import { logger } from '@/lib/logger';
import type { CapturedScreenshot, ScreenshotSelection } from '@/lib/project-screenshots/types';
import type { DecryptedAiConfig } from '@/lib/site-ai-settings';

const MAX_GALLERY = 4;

function normalizeIndex(value: unknown, max: number): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return null;
  }
  if (value < 0 || value >= max) {
    return null;
  }
  return value;
}

function fallbackSelection(count: number): ScreenshotSelection {
  const galleryIndices = Array.from(
    { length: Math.min(MAX_GALLERY, count) },
    (_, index) => index,
  );

  return {
    coverIndex: 0,
    galleryIndices,
  };
}

function buildSelectionPrompt(pageTitle: string, captureCount: number): string {
  return [
    'You are a senior portfolio curator reviewing website screenshots for a developer portfolio.',
    `Page title: "${pageTitle}"`,
    `There are ${captureCount} screenshots attached in order (shot-0 = top of page, higher indices = lower sections).`,
    'Pick the most visually impressive screenshots that showcase UI design, layout quality, and product polish.',
    'Avoid shots that are mostly blank, error pages, cookie banners only, or login forms unless nothing else exists.',
    `Select exactly one cover image (best first impression) and up to ${MAX_GALLERY} gallery images.`,
    'Return ONLY valid JSON with this shape:',
    '{"coverIndex":0,"galleryIndices":[0,1,2]}',
    'galleryIndices must be unique, sorted ascending, and include coverIndex.',
  ].join('\n');
}

function parseSelection(
  data: Record<string, unknown>,
  captureCount: number,
): ScreenshotSelection | null {
  const coverIndex = normalizeIndex(data.coverIndex, captureCount);
  if (coverIndex === null) {
    return null;
  }

  const rawGallery = data.galleryIndices;
  if (!Array.isArray(rawGallery)) {
    return null;
  }

  const galleryIndices = rawGallery
    .map((item) => normalizeIndex(item, captureCount))
    .filter((item): item is number => item !== null);

  const unique = [...new Set([coverIndex, ...galleryIndices])].slice(0, MAX_GALLERY);
  if (unique.length === 0) {
    return null;
  }

  return {
    coverIndex,
    galleryIndices: unique.sort((a, b) => a - b),
  };
}

export async function selectBestScreenshots(
  captures: CapturedScreenshot[],
  pageTitle: string,
  config: DecryptedAiConfig | null,
): Promise<ScreenshotSelection> {
  if (captures.length === 0) {
    throw new Error('No screenshots captured');
  }

  if (captures.length === 1) {
    return { coverIndex: 0, galleryIndices: [0] };
  }

  if (!config || config.provider !== 'gemini' || !config.geminiApiKey?.trim()) {
    return fallbackSelection(captures.length);
  }

  try {
    const images = captures.map((capture) => ({
      mimeType: 'image/jpeg',
      base64: capture.buffer.toString('base64'),
    }));

    const response = await generateGeminiVisionJson(
      config,
      buildSelectionPrompt(pageTitle, captures.length),
      images,
    );

    const parsed = parseSelection(response, captures.length);
    if (parsed) {
      return parsed;
    }

    logger.warn('AI screenshot selection returned invalid indices, using fallback');
    return fallbackSelection(captures.length);
  } catch (error) {
    logger.warn('AI screenshot selection failed, using fallback', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return fallbackSelection(captures.length);
  }
}
