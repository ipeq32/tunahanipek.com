import imageCompression from 'browser-image-compression';

export type CompressImageOptions = {
  /** Hedef azami dosya boyutu (MB). */
  maxSizeMB: number;
  /** Görselin en uzun kenarı için azami piksel değeri. */
  maxWidthOrHeight: number;
};

/**
 * Verilen görsel dosyasını tarayıcıda sıkıştırır ve yeniden boyutlandırır.
 * İşlem bir web worker üzerinde çalıştırılarak ana iş parçacığı bloklanmaz.
 *
 * Sıkıştırma başarısız olursa (ör. desteklenmeyen format) hata fırlatılır;
 * çağıran taraf orijinal dosyaya geri dönüş (fallback) kararını verebilir.
 */
export async function compressImage(
  file: File,
  { maxSizeMB, maxWidthOrHeight }: CompressImageOptions
): Promise<File> {
  const compressed = await imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
  });

  // Sıkıştırma kütüphanesi bazı durumlarda orijinal `File` adını koruyamayabilir;
  // sunucu tarafındaki uzantı/içerik tutarlılığı için adı geri yansıtırız.
  return new File([compressed], file.name, {
    type: compressed.type || file.type,
    lastModified: Date.now(),
  });
}
