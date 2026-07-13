/**
 * Manual assertions for note save fingerprint. Run: npx tsx utils/noteSave.test.ts
 */
import { Note } from '@/services/storage';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function noteFingerprint(note: Note): string {
  return JSON.stringify({
    title: note.title,
    content: note.content,
    extraNotes: note.extraNotes,
    isFlagged: note.isFlagged,
    reminderAt: note.reminderAt,
    followUpStatus: note.followUpStatus,
    notePasswordEnabled: note.notePasswordEnabled,
    attachments: note.attachments?.map((a) => a.id),
  });
}

const base: Note = {
  id: 'note_test',
  title: 'Visit',
  content: 'BP 120/80',
  createdAt: '2026-07-13T00:00:00.000Z',
  updatedAt: '2026-07-13T00:00:00.000Z',
  extraNotes: '',
  isFlagged: false,
  reminderAt: null,
  followUpStatus: 'open',
  notePasswordEnabled: false,
  attachments: [],
};

const fp1 = noteFingerprint(base);
const fp2 = noteFingerprint({ ...base });
assert(fp1 === fp2, 'Identical notes produce same fingerprint');

const fp3 = noteFingerprint({ ...base, content: 'BP 118/76' });
assert(fp1 !== fp3, 'Content change changes fingerprint');

const fp4 = noteFingerprint({
  ...base,
  attachments: [{ id: 'att_1', type: 'voice_memo', filename: 'v.m4a', mimeType: 'audio/mp4', encryptedPath: '/x', createdAt: '' }],
});
assert(fp1 !== fp4, 'New attachment changes fingerprint');

console.log('noteSave.test.ts: all assertions passed');
