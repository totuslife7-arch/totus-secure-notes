import * as ScreenCapture from 'expo-screen-capture';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAppTheme } from '@/context/ThemeContext';
import { decryptAttachmentToBase64, secureDeleteAttachment } from '@/services/attachments';
import { appendAuditEvent } from '@/services/auditLog';
import { EncryptedAttachment } from '@/services/storage';

type Props = {
  attachment: EncryptedAttachment;
  password: string;
  auditPassword?: string;
  visible: boolean;
  onClose: () => void;
  onDeleted?: () => void;
};

export default function AttachmentViewer({
  attachment,
  password,
  auditPassword,
  visible,
  onClose,
  onDeleted,
}: Props) {
  const { theme } = useAppTheme();
  const [dataUri, setDataUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const b64 = await decryptAttachmentToBase64(attachment, password);
      const mime = attachment.mimeType || 'image/jpeg';
      setDataUri(`data:${mime};base64,${b64}`);
      if (auditPassword) {
        await appendAuditEvent(
          auditPassword,
          'attachment_view',
          `${attachment.type}:${attachment.id}`,
        );
      }
    } catch {
      setError('Could not decrypt attachment.');
    } finally {
      setLoading(false);
    }
  }, [attachment, password, auditPassword]);

  useEffect(() => {
    if (!visible) {
      setDataUri(null);
      return;
    }
    load().catch(() => undefined);
  }, [visible, load]);

  useEffect(() => {
    if (!visible) return;
    ScreenCapture.preventScreenCaptureAsync().catch(() => undefined);
    return () => {
      ScreenCapture.allowScreenCaptureAsync().catch(() => undefined);
    };
  }, [visible]);

  const handleSecureDelete = () => {
    Alert.alert(
      'Secure delete?',
      'This shreds the encrypted file in your vault. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete permanently',
          style: 'destructive',
          onPress: async () => {
            await secureDeleteAttachment(attachment, auditPassword);
            onDeleted?.();
            onClose();
          },
        },
      ],
    );
  };

  const isPhoto = attachment.type === 'photo';

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable onPress={onClose}>
            <Text style={{ color: theme.primary, fontWeight: '600' }}>Close</Text>
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {attachment.filename}
          </Text>
          <Pressable onPress={handleSecureDelete}>
            <Text style={{ color: theme.danger, fontWeight: '600' }}>Delete</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={styles.center} />
        ) : error ? (
          <Text style={[styles.center, { color: theme.danger }]}>{error}</Text>
        ) : isPhoto && dataUri ? (
          <Image source={{ uri: dataUri }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.center}>
            <Text style={{ color: theme.textMuted, textAlign: 'center', padding: 24 }}>
              {attachment.type === 'video' ? 'Video' : 'Audio'} attachment encrypted in vault.
              {'\n'}Filename: {attachment.filename}
              {'\n\n'}Playback in-app coming soon. Export via note backup if needed.
            </Text>
          </View>
        )}

        <Text style={[styles.footer, { color: theme.textMuted }]}>
          Viewed only inside Totus. Screen capture blocked while open.
        </Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: { flex: 1, textAlign: 'center', fontWeight: '600', marginHorizontal: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  image: { flex: 1, width: '100%' },
  footer: { fontSize: 12, textAlign: 'center', padding: 12 },
});
