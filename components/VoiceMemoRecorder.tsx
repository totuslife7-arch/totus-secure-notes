import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/context/ThemeContext';

type Props = {
  disabled?: boolean;
  onRecorded: (uri: string, durationMs: number) => void | Promise<void>;
};

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export default function VoiceMemoRecorder({ disabled, onRecorded }: Props) {
  const { theme } = useAppTheme();
  const [permissionReady, setPermissionReady] = useState(false);
  const [busy, setBusy] = useState(false);

  const recorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    directory: 'document',
  });
  const recorderState = useAudioRecorderState(recorder, 250);

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        setPermissionReady(false);
        return;
      }
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
      setPermissionReady(true);
    })().catch(() => setPermissionReady(false));
  }, []);

  const handleStart = useCallback(async () => {
    if (!permissionReady) {
      Alert.alert('Microphone', 'Allow microphone access to record encrypted voice memos.');
      return;
    }
    try {
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch {
      Alert.alert('Recording failed', 'Could not start voice memo recording.');
    }
  }, [permissionReady, recorder]);

  const handleStop = useCallback(async () => {
    if (!recorderState.isRecording) return;
    setBusy(true);
    try {
      await recorder.stop();
      const uri = recorder.uri;
      const durationMs = recorderState.durationMillis;
      if (!uri) {
        Alert.alert('Recording failed', 'No audio was captured. Try again.');
        return;
      }
      await onRecorded(uri, durationMs);
    } catch {
      Alert.alert('Recording failed', 'Could not finish voice memo recording.');
    } finally {
      setBusy(false);
    }
  }, [onRecorded, recorder, recorderState.durationMillis, recorderState.isRecording]);

  const isRecording = recorderState.isRecording;
  const durationLabel = formatDuration(recorderState.durationMillis);

  return (
    <View style={[styles.container, { borderColor: theme.border, backgroundColor: theme.surface }]}>
      <View style={styles.row}>
        <Pressable
          style={[
            styles.recordButton,
            {
              backgroundColor: isRecording ? theme.danger : theme.primary,
              opacity: disabled || busy ? 0.6 : 1,
            },
          ]}
          onPress={isRecording ? handleStop : handleStart}
          disabled={disabled || busy}>
          <Text style={styles.recordButtonText}>{isRecording ? 'Stop' : 'Record'}</Text>
        </Pressable>
        <View style={styles.timerBlock}>
          <Text style={[styles.timer, { color: theme.text }]}>{durationLabel}</Text>
          <Text style={[styles.hint, { color: theme.textMuted }]}>
            {isRecording ? 'Recording…' : 'Voice memo (encrypted)'}
          </Text>
        </View>
      </View>
      {isRecording ? (
        <View style={styles.waveRow}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[
                styles.waveBar,
                {
                  backgroundColor: theme.primary,
                  height: 8 + (i % 3) * 6 + (recorderState.isRecording ? 4 : 0),
                },
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recordButton: { borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  recordButtonText: { color: '#fff', fontWeight: '700' },
  timerBlock: { flex: 1 },
  timer: { fontSize: 20, fontWeight: '700', fontVariant: ['tabular-nums'] },
  hint: { fontSize: 12, marginTop: 2 },
  waveRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 28 },
  waveBar: { width: 4, borderRadius: 2 },
});
