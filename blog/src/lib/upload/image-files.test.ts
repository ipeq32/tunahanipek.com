import { describe, expect, it } from 'vitest';
import {
  getImageFilesFromClipboard,
  getImageFilesFromDataTransfer,
  isImageFile,
} from '@/lib/upload/image-files';

describe('image-files', () => {
  it('detects image mime types', () => {
    expect(isImageFile(new File(['x'], 'a.png', { type: 'image/png' }))).toBe(
      true,
    );
    expect(isImageFile(new File(['x'], 'a.pdf', { type: 'application/pdf' }))).toBe(
      false,
    );
  });

  it('extracts image files from data transfer', () => {
    const image = new File(['x'], 'shot.png', { type: 'image/png' });
    const pdf = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
    const dataTransfer = {
      items: [],
      files: [image, pdf],
      types: ['Files'],
    } as unknown as DataTransfer;

    expect(getImageFilesFromDataTransfer(dataTransfer)).toEqual([image]);
  });

  it('extracts pasted image files from clipboard', () => {
    const image = new File(['x'], 'paste.png', { type: 'image/png' });
    const clipboard = {
      items: [
        {
          kind: 'file',
          type: 'image/png',
          getAsFile: () => image,
        },
      ],
      files: [],
      types: ['Files'],
    } as unknown as DataTransfer;

    expect(getImageFilesFromClipboard(clipboard)).toEqual([image]);
  });
});
