import { ensureNotificationPermissions, scheduleNoteReminder } from '@/services/notifications';
import { Note } from '@/services/storage';

/** Re-schedule local notifications for all notes with future reminderAt. */
export async function syncAllNoteReminders(
  notes: Note[],
  existingIds: Map<string, string>,
): Promise<Map<string, string>> {
  const granted = await ensureNotificationPermissions();
  const next = new Map<string, string>();
  if (!granted) {
    return next;
  }

  const now = Date.now();
  for (const note of notes) {
    if (!note.reminderAt) continue;
    const when = new Date(note.reminderAt).getTime();
    if (Number.isNaN(when) || when <= now) continue;

    const id = await scheduleNoteReminder(note.id, note.title, note.reminderAt);
    if (id) {
      next.set(note.id, id);
      existingIds.delete(note.id);
    }
  }
  return next;
}
