export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Yalnızca işletim sisteminden gelen gerçek dosya sürüklemelerinde `true` döner.
 * Sayfa içi `<img>`/metin sürüklemelerinde `types` yalnızca `text/*` içerir ve
 * `'Files'` bulunmaz; bu sayede önizleme görselini sürükleyip bırakmak yanlışlıkla
 * yeniden yükleme tetiklemez.
 */
export function dataTransferHasFiles(
  dataTransfer: DataTransfer | null,
): boolean {
  if (!dataTransfer) {
    return false;
  }

  return Array.from(dataTransfer.types).includes('Files');
}

export function getImageFilesFromDataTransfer(
  dataTransfer: DataTransfer | null,
): File[] {
  if (!dataTransfer) {
    return [];
  }

  const fromItems = Array.from(dataTransfer.items)
    .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
    .map((item) => item.getAsFile())
    .filter((file): file is File => file !== null);

  if (fromItems.length > 0) {
    return fromItems;
  }

  return Array.from(dataTransfer.files).filter(isImageFile);
}

export function getImageFilesFromClipboard(
  clipboardData: DataTransfer | null,
): File[] {
  if (!clipboardData) {
    return [];
  }

  return Array.from(clipboardData.items)
    .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
    .map((item) => item.getAsFile())
    .filter((file): file is File => file !== null);
}
