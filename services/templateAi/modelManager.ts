import * as FileSystem from 'expo-file-system/legacy';

import { TEMPLATE_AI_DIR, TEMPLATE_AI_MODEL } from '@/constants/templateAiConfig';

export type DownloadProgress = {
  totalBytes: number;
  downloadedBytes: number;
  fraction: number;
};

function modelDir(): string {
  return `${FileSystem.documentDirectory}${TEMPLATE_AI_DIR}/`;
}

export function getModelFilePath(): string {
  return `${modelDir()}${TEMPLATE_AI_MODEL.filename}`;
}

export async function isModelReady(): Promise<boolean> {
  const path = getModelFilePath();
  const info = await FileSystem.getInfoAsync(path);
  return info.exists && (info.size ?? 0) > 50_000_000;
}

export async function getModelSizeOnDisk(): Promise<number> {
  const path = getModelFilePath();
  const info = await FileSystem.getInfoAsync(path);
  return info.exists ? (info.size ?? 0) : 0;
}

export async function deleteModel(): Promise<void> {
  const path = getModelFilePath();
  const info = await FileSystem.getInfoAsync(path);
  if (info.exists) {
    await FileSystem.deleteAsync(path, { idempotent: true });
  }
}

let activeDownload: FileSystem.DownloadResumable | null = null;

export async function cancelModelDownload(): Promise<void> {
  if (activeDownload) {
    await activeDownload.pauseAsync();
    activeDownload = null;
  }
}

export async function downloadModel(
  onProgress?: (progress: DownloadProgress) => void,
): Promise<string> {
  const dir = modelDir();
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }

  const dest = getModelFilePath();
  const existing = await FileSystem.getInfoAsync(dest);
  if (existing.exists && (existing.size ?? 0) > 50_000_000) {
    return dest;
  }

  const callback = (data: FileSystem.DownloadProgressData) => {
    const total = data.totalBytesExpectedToWrite || TEMPLATE_AI_MODEL.sizeBytes;
    onProgress?.({
      totalBytes: total,
      downloadedBytes: data.totalBytesWritten,
      fraction: total > 0 ? data.totalBytesWritten / total : 0,
    });
  };

  activeDownload = FileSystem.createDownloadResumable(
    TEMPLATE_AI_MODEL.url,
    dest,
    {},
    callback,
  );

  const result = await activeDownload.downloadAsync();
  activeDownload = null;

  if (!result?.uri) {
    throw new Error('Model download failed.');
  }
  return result.uri;
}
