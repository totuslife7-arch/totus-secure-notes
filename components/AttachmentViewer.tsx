import * as FileSystem from 'expo-file-system/legacy';
import * as ScreenCapture from 'expo-screen-capture';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
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
  const [playbackUri, setPlaybackUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isPhoto = attachment.type === 'photo';
  const isPlayableAudio = attachment.type === 'audio' || attachment.type === 'voice_memo';
  const player = useAudioPlayer(playbackUri ? { uri: playbackUri } : null);
  const playerStatus = useAudioPlayerStatus(player);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const b64 = await decryptAttachmentToBase64(attachment, password);
      const mime = attachment.mimeType || 'image/jpeg';
      setDataUri(`data:${mime};base64,${b64}`);

      if (attachment.type === 'audio' || attachment.type === 'voice_memo') {
        const tempPath = `${FileSystem.cacheDirectory}totus_playback_${attachment.id}.m4a`;
        await FileSystem.writeAsStringAsync(tempPath, b64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setPlaybackUri(tempPath);
      } else {
        setPlaybackUri(null);
      }
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
      setPlaybackUri(null);
      player.pause();
      return;
    }
    load().catch(() => undefined);
  }, [visible, load, player]);

  useEffect(() => {
    return () => {
      if (playbackUri) {
        FileSystem.deleteAsync(playbackUri, { idempotent: true }).catch(() => undefined);
      }
    };
  }, [playbackUri]);

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

  const togglePlayback = () => {
    if (!playbackUri) return;
    if (playerStatus.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

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
        ) : isPlayableAudio && playbackUri ? (
          <View style={styles.center}>
            <Text style={{ color: theme.text, fontWeight: '600', marginBottom: 12 }}>
              {attachment.type === 'voice_memo' ? 'Voice memo' : 'Audio'} · {attachment.filename}
            </Text>
            <Pressable
              style={[styles.playButton, { backgroundColor: theme.primary }]}
              onPress={togglePlayback}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>
                {playerStatus.playing ? 'Pause' : 'Play'}
              </Text>
            </Pressable>
            <Text style={{ color: theme.textMuted, marginTop: 12, fontSize: 13 }}>
              {playerStatus.duration
                ? `${Math.floor(playerStatus.currentTime)}s / ${Math.floor(playerStatus.duration)}s`
                : 'Encrypted playback inside Totus only'}
            </Text>
          </View>
        ) : (
          <View style={styles.center}>
            <Text style={{ color: theme.textMuted, textAlign: 'center', padding: 24 }}>
              Video attachment encrypted in vault.
              {'\n'}Filename: {attachment.filename}
              {'\n\n'}Export via note backup if needed.
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
  playButton: { borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  footer: { fontSize: 12, textAlign: 'center', padding: 12 },
});
