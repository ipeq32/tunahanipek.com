'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getImageFilesFromClipboard,
  getImageFilesFromDataTransfer,
} from '@/lib/upload/image-files';

type UseImageDropPasteOptions = {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  multiple?: boolean;
};

export function useImageDropPaste({
  onFiles,
  disabled = false,
  multiple = false,
}: UseImageDropPasteOptions) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const dragDepthRef = useRef(0);
  const isHoveringRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = useCallback(
    (files: File[]) => {
      if (disabled || files.length === 0) {
        return false;
      }

      const selected = multiple ? files : files.slice(0, 1);
      onFiles(selected);
      return true;
    },
    [disabled, multiple, onFiles],
  );

  const onDragEnter = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (disabled) {
        return;
      }

      dragDepthRef.current += 1;
      if (
        event.dataTransfer.types.includes('Files') ||
        getImageFilesFromDataTransfer(event.dataTransfer).length > 0
      ) {
        setIsDragging(true);
      }
    },
    [disabled],
  );

  const onDragLeave = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const onDragOver = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (disabled) {
        return;
      }
      event.dataTransfer.dropEffect = 'copy';
    },
    [disabled],
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      dragDepthRef.current = 0;
      setIsDragging(false);
      if (disabled) {
        return;
      }

      const images = getImageFilesFromDataTransfer(event.dataTransfer);
      processFiles(images);
    },
    [disabled, processFiles],
  );

  const onMouseEnter = useCallback(() => {
    isHoveringRef.current = true;
  }, []);

  const onMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
  }, []);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (disabled) {
        return;
      }

      const zone = zoneRef.current;
      if (!zone) {
        return;
      }

      const activeInZone =
        zone.contains(document.activeElement) || isHoveringRef.current;
      if (!activeInZone) {
        return;
      }

      const images = getImageFilesFromClipboard(event.clipboardData);
      if (images.length === 0) {
        return;
      }

      event.preventDefault();
      processFiles(images);
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [disabled, processFiles]);

  return {
    zoneRef,
    isDragging,
    dropZoneProps: {
      onDragEnter,
      onDragLeave,
      onDragOver,
      onDrop,
      onMouseEnter,
      onMouseLeave,
    },
  };
}
