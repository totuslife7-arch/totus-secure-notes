import * as FileSystem from 'expo-file-system/legacy';

import { TEMPLATE_AI_DIR, TEMPLATE_AI_MODEL } from '@/constants/templateAiConfig';
import { base64ToBytes } from '@/utils/base64';

export type DownloadProgress = {
  totalBytes: number;
  downloadedBytes: number;
  fraction: number;
};

export type ModelVerifyResult = {
  valid: boolean;
  size: number;
  reason?: 'not_found' | 'too_small' | 'bad_header' | 'read_failed';
};

const MIN_MODEL_BYTES = 50_000_000;
const GGUF_MAGIC = 'GGUF';

function modelDir(): string {
  return `${FileSystem.documentDirectory}${TEMPLATE_AI_DIR}/`;
}

export function getModelFilePath(): string {
  return `${modelDir()}${TEMPLATE_AI_MODEL.filename}`;
}

/** Verify model file exists, meets size threshold, and has GGUF header magic. */
export async function verifyModelFile(): Promise<ModelVerifyResult> {
  const path = getModelFilePath();
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) {
    return { valid: false, size: 0, reason: 'not_found' };
  }

  const size = info.size ?? 0;
  if (size < MIN_MODEL_BYTES) {
    return { valid: false, size, reason: 'too_small' };
  }

  try {
    const headerB64 = await FileSystem.readAsStringAsync(path, {
      encoding: FileSystem.EncodingType.Base64,
      length: 8,
      position: 0,
    });
    const bytes = base64ToBytes(headerB64);
    const magic = String.fromCharCode(bytes[0] ?? 0, bytes[1] ?? 0, bytes[2] ?? 0, bytes[3] ?? 0);
    if (magic !== GGUF_MAGIC) {
      return { valid: false, size, reason: 'bad_header' };
    }
  } catch {
    return { valid: false, size, reason: 'read_failed' };
  }

  return { valid: true, size };
}

export async function isModelReady(): Promise<boolean> {
  const result = await verifyModelFile();
  return result.valid;
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
  if (existing.exists) {
    const verified = await verifyModelFile();
    if (verified.valid) {
      return dest;
    }
    await FileSystem.deleteAsync(dest, { idempotent: true });
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

  const verified = await verifyModelFile();
  if (!verified.valid) {
    await FileSystem.deleteAsync(dest, { idempotent: true });
    throw new Error(
      verified.reason === 'bad_header'
        ? 'Downloaded file is corrupt (invalid GGUF header). Try again on Wi‑Fi.'
        : 'Downloaded model file failed verification. Try again.',
    );
  }

  return result.uri;
}
