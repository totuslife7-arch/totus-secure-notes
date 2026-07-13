import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { doc, getDoc, getFirestore, type Firestore } from 'firebase/firestore';
import { Platform } from 'react-native';

import { FIREBASE_CONFIG } from '@/constants/firebaseConfig';
import { POLICY_LINKS, type PolicyDocId } from '@/constants/policyUrls';

function policyUrlForId(id: PolicyDocId): string {
  return POLICY_LINKS.find((l) => l.id === id)?.url ?? 'https://totus--notes.web.app';
}

export interface PolicyDocument {
  id: PolicyDocId;
  version: string;
  title: string;
  effectiveDate: string;
  publicUrl: string;
  updatedAt?: string;
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

function getFirebaseApp(): FirebaseApp {
  if (app) return app;
  if (getApps().length > 0) {
    app = getApps()[0]!;
    return app;
  }
  app = initializeApp(FIREBASE_CONFIG);
  return app;
}

function getDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}

/** Fetch policy metadata from Firestore (public read). Notes content is never uploaded. */
export async function fetchPolicyDocument(id: PolicyDocId): Promise<PolicyDocument | null> {
  if (Platform.OS === 'web') {
    return {
      id,
      version: 'hosted',
      title: id,
      effectiveDate: '',
      publicUrl: policyUrlForId(id),
    };
  }

  try {
    const snap = await getDoc(doc(getDb(), 'policies', id));
    if (!snap.exists()) {
      return {
        id,
        version: 'hosted',
        title: id,
        effectiveDate: '',
        publicUrl: policyUrlForId(id),
      };
    }
    const data = snap.data();
    return {
      id,
      version: String(data.version ?? ''),
      title: String(data.title ?? id),
      effectiveDate: String(data.effectiveDate ?? ''),
      publicUrl: String(data.publicUrl ?? policyUrlForId(id)),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() ?? undefined,
    };
  } catch (e) {
    console.warn('[Firebase] fetchPolicyDocument failed', id, e);
    return {
      id,
      version: 'hosted',
      title: id,
      effectiveDate: '',
      publicUrl: policyUrlForId(id),
    };
  }
}

export async function fetchAllPolicyVersions(): Promise<Partial<Record<PolicyDocId, PolicyDocument | null>>> {
  const ids: PolicyDocId[] = POLICY_LINKS.map((l) => l.id);
  const entries = await Promise.all(ids.map(async (id) => [id, await fetchPolicyDocument(id)] as const));
  return Object.fromEntries(entries) as Partial<Record<PolicyDocId, PolicyDocument | null>>;
}
