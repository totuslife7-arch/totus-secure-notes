import { Note } from '@/services/storage';

export interface TaskDigestItem {
  noteId: string;
  title: string;
  reason: string;
}

export interface TaskDigest {
  openFollowUps: TaskDigestItem[];
  dueReminders: TaskDigestItem[];
  flaggedNotes: TaskDigestItem[];
  summary: string;
}

export function buildTaskDigest(notes: Note[], now = new Date()): TaskDigest {
  const openFollowUps: TaskDigestItem[] = [];
  const dueReminders: TaskDigestItem[] = [];
  const flaggedNotes: TaskDigestItem[] = [];

  for (const note of notes) {
    if (note.isFlagged) {
      flaggedNotes.push({
        noteId: note.id,
        title: note.title || 'Untitled Note',
        reason: 'Flagged for follow-up',
      });
    }

    if (note.followUpStatus === 'open') {
      openFollowUps.push({
        noteId: note.id,
        title: note.title || 'Untitled Note',
        reason: 'Open follow-up task',
      });
    }

    if (note.reminderAt) {
      const reminderDate = new Date(note.reminderAt);
      if (!Number.isNaN(reminderDate.getTime()) && reminderDate <= now) {
        dueReminders.push({
          noteId: note.id,
          title: note.title || 'Untitled Note',
          reason: `Reminder due ${reminderDate.toLocaleString()}`,
        });
      }
    }
  }

  const parts: string[] = [];
  if (openFollowUps.length) {
    parts.push(`${openFollowUps.length} open follow-up${openFollowUps.length === 1 ? '' : 's'}`);
  }
  if (dueReminders.length) {
    parts.push(`${dueReminders.length} due reminder${dueReminders.length === 1 ? '' : 's'}`);
  }
  if (flaggedNotes.length) {
    parts.push(`${flaggedNotes.length} flagged note${flaggedNotes.length === 1 ? '' : 's'}`);
  }

  const summary = parts.length
    ? parts.join(' · ')
    : 'No open follow-ups, due reminders, or flagged notes.';

  return { openFollowUps, dueReminders, flaggedNotes, summary };
}
