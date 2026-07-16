import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import { appendAuditEvent } from '@/services/auditLog';
import { secureDeleteFile } from '@/services/secureDelete';
import { encryptBytesWithSessionKey } from '@/services/sessionCrypto';
import {
  createNoteId,
  EncryptedAttachment,
  getVaultAttachmentsDir,
} from '@/services/storage';
import { base64ToBytes, bytesToBase64 } from '@/utils/base64';

export type AttachmentPickResult = {
  attachment: EncryptedAttachment;
  /** Legacy: gallery scrub removed for Play policy compliance (photo picker only). */
  sourceScrubbed: boolean;
};

async function ensureAttachmentsDir(): Promise<void> {
  const dir = getVaultAttachmentsDir();
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
}

async function readFileAsBase64(uri: string): Promise<string> {
  return FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
}

async function deleteTempFile(uri: string): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch {
    // Best-effort temp cleanup
  }
}

async function encryptBytesToVault(
  password: string,
  noteId: string,
  bytes: Uint8Array,
  type: EncryptedAttachment['type'],
  filename: string,
  mimeType: string,
  sourceAssetId?: string | null,
): Promise<EncryptedAttachment> {
  const payload = await encryptBytesWithSessionKey(bytes, password);

  await ensureAttachmentsDir();
  const attachmentId = createNoteId().replace('note_', 'att_');
  const encryptedPath = `${getVaultAttachmentsDir()}${noteId}_${attachmentId}.enc`;
  await FileSystem.writeAsStringAsync(encryptedPath, JSON.stringify(payload));

  return {
    id: attachmentId,
    type,
    filename,
    mimeType,
    encryptedPath,
    createdAt: new Date().toISOString(),
    sourceAssetId: sourceAssetId ?? null,
  };
}

async function encryptAssetToVault(
  password: string,
  noteId: string,
  asset: ImagePicker.ImagePickerAsset,
  type: EncryptedAttachment['type'],
  defaultFilename: string,
  defaultMime: string,
): Promise<EncryptedAttachment> {
  const tempUri = asset.uri;
  const b64 = await readFileAsBase64(tempUri);
  const bytes = base64ToBytes(b64);

  try {
    return await encryptBytesToVault(
      password,
      noteId,
      bytes,
      type,
      asset.fileName ?? defaultFilename,
      asset.mimeType ?? defaultMime,
      asset.assetId ?? null,
    );
  } finally {
    await deleteTempFile(tempUri);
  }
}

export async function encryptFileUriToVault(
  password: string,
  noteId: string,
  uri: string,
  type: EncryptedAttachment['type'],
  filename: string,
  mimeType: string,
  auditPassword?: string,
): Promise<EncryptedAttachment | null> {
  try {
    const b64 = await readFileAsBase64(uri);
    const bytes = base64ToBytes(b64);
    const attachment = await encryptBytesToVault(password, noteId, bytes, type, filename, mimeType);
    if (auditPassword) {
      await appendAuditEvent(auditPassword, 'attachment_add', `${attachment.type}:${attachment.id}`);
    }
    return attachment;
  } catch {
    return null;
  } finally {
    await deleteTempFile(uri);
  }
}

export async function recordAndEncryptVoiceMemo(
  password: string,
  noteId: string,
  recordingUri: string,
  auditPassword?: string,
): Promise<AttachmentPickResult | null> {
  const attachment = await encryptFileUriToVault(
    password,
    noteId,
    recordingUri,
    'voice_memo',
    `voice_${Date.now()}.m4a`,
    'audio/mp4',
    auditPassword,
  );
  if (!attachment) {
    return null;
  }
  return { attachment, sourceScrubbed: false };
}

export async function pickAndEncryptPhoto(
  password: string,
  noteId: string,
  auditPassword?: string,
): Promise<AttachmentPickResult | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.85,
    exif: false,
  });

  if (result.canceled || !result.assets?.[0]?.uri) {
    return null;
  }

  const asset = result.assets[0];
  const tempUri = asset.uri;

  try {
    const attachment = await encryptAssetToVault(
      password,
      noteId,
      asset,
      'photo',
      `photo_${Date.now()}.jpg`,
      'image/jpeg',
    );

    if (auditPassword) {
      await appendAuditEvent(auditPassword, 'attachment_add', `${attachment.type}:${attachment.id}`);
    }

    return { attachment, sourceScrubbed: false };
  } catch {
    await deleteTempFile(tempUri);
    return null;
  }
}

export async function pickAndEncryptPhotoFromLibrary(
  password: string,
  noteId: string,
  auditPassword?: string,
): Promise<AttachmentPickResult | null> {
  // Android: expo-image-picker uses system Photo Picker (PickVisualMedia) — no READ_MEDIA_* permission.
  if (Platform.OS === 'ios') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return null;
    }
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.85,
    exif: false,
  });

  if (result.canceled || !result.assets?.[0]?.uri) {
    return null;
  }

  const asset = result.assets[0];
  const tempUri = asset.uri;

  try {
    const attachment = await encryptAssetToVault(
      password,
      noteId,
      asset,
      'photo',
      `photo_${Date.now()}.jpg`,
      'image/jpeg',
    );

    if (auditPassword) {
      await appendAuditEvent(auditPassword, 'attachment_add', `${attachment.type}:${attachment.id}`);
    }

    return { attachment, sourceScrubbed: false };
  } catch {
    await deleteTempFile(tempUri);
    return null;
  }
}

export async function pickAndEncryptAudio(
  password: string,
  noteId: string,
  auditPassword?: string,
): Promise<AttachmentPickResult | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['audio/*', 'video/*'],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]?.uri) {
    return null;
  }

  const file = result.assets[0];
  const tempUri = file.uri;
  const isVideo = (file.mimeType ?? '').startsWith('video/');
  const type: EncryptedAttachment['type'] = isVideo ? 'video' : 'audio';

  try {
    const attachment = await encryptFileUriToVault(
      password,
      noteId,
      tempUri,
      type,
      file.name ?? (isVideo ? `video_${Date.now()}.mp4` : `audio_${Date.now()}.m4a`),
      file.mimeType ?? (isVideo ? 'video/mp4' : 'audio/mp4'),
      auditPassword,
    );
    if (!attachment) {
      return null;
    }
    return { attachment, sourceScrubbed: false };
  } finally {
    await deleteTempFile(tempUri);
  }
}

export async function secureDeleteAttachment(
  attachment: EncryptedAttachment,
  auditPassword?: string,
): Promise<void> {
  await secureDeleteFile(attachment.encryptedPath);
  if (auditPassword) {
    await appendAuditEvent(
      auditPassword,
      'attachment_delete',
      `${attachment.type}:${attachment.id}`,
    );
  }
}

/** @deprecated Use secureDeleteAttachment */
export async function deleteAttachmentFile(attachment: EncryptedAttachment): Promise<void> {
  await secureDeleteAttachment(attachment);
}

export async function decryptAttachmentToBase64(
  attachment: EncryptedAttachment,
  password: string,
): Promise<string> {
  const json = await FileSystem.readAsStringAsync(attachment.encryptedPath);
  const payload = JSON.parse(json);
  const { decryptBytesWithSessionKey } = await import('@/services/sessionCrypto');
  const bytes = await decryptBytesWithSessionKey(payload, password);
  return bytesToBase64(bytes);
}
