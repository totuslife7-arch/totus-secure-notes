import * as FileSystem from 'expo-file-system/legacy';

const SHRED_PASSES = 3;

/** Best-effort secure delete: overwrite then remove. Mobile FS may not guarantee forensic erasure. */
export async function secureDeleteFile(path: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists || !info.size) {
    await FileSystem.deleteAsync(path, { idempotent: true });
    return;
  }

  const size = info.size;
  try {
    for (let pass = 0; pass < SHRED_PASSES; pass++) {
      const pattern = pass % 2 === 0 ? '\x00' : '\xff';
      const chunkLen = Math.min(size, 64_000);
      const chunk = pattern.repeat(chunkLen);
      let written = 0;
      while (written < size) {
        const slice = chunk.slice(0, Math.min(chunkLen, size - written));
        if (written === 0) {
          await FileSystem.writeAsStringAsync(path, slice, {
            encoding: FileSystem.EncodingType.UTF8,
          });
        } else {
          // Append overwrite via write — limited on some platforms; still better than plain delete.
          await FileSystem.writeAsStringAsync(path, slice, {
            encoding: FileSystem.EncodingType.UTF8,
          });
        }
        written += slice.length;
        if (slice.length === 0) break;
      }
    }
  } catch {
    // Fall through to delete
  }

  await FileSystem.deleteAsync(path, { idempotent: true });
}
