import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensureNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleNoteReminder(
  noteId: string,
  title: string,
  reminderAt: string,
): Promise<string | null> {
  const granted = await ensureNotificationPermissions();
  if (!granted) {
    return null;
  }

  const triggerDate = new Date(reminderAt);
  if (Number.isNaN(triggerDate.getTime()) || triggerDate.getTime() <= Date.now()) {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Note Reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Note reminder',
      body: title || 'You have a note follow-up',
      data: { noteId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
      channelId: Platform.OS === 'android' ? 'reminders' : undefined,
    },
  });

  return id;
}

export async function cancelReminder(notificationId: string | null | undefined): Promise<void> {
  if (!notificationId) {
    return;
  }
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
