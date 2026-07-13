import { gcm } from '@noble/ciphers/aes.js';
import { argon2id } from '@noble/hashes/argon2.js';
import { hmac } from '@noble/hashes/hmac.js';
import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import * as Crypto from 'expo-crypto';

import { base64ToBytes, bytesToBase64 } from '@/utils/base64';
import { zeroize } from '@/utils/zeroize';

export const PBKDF2_ITERATIONS = 100_000;
/** Argon2id defaults — memory-hard KDF (Layer 1). m is KiB per RFC 9106 / @noble/hashes. */
export const ARGON2ID_DEFAULTS = { t: 3, m: 16384, p: 1 } as const;

const KEY_LENGTH = 32;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

export type KdfAlgorithm = 'pbkdf2' | 'argon2id';

export interface Argon2Params {
  t: number;
  m: number;
  p: number;
}

export interface Pbkdf2Params {
  iterations: number;
}

export interface WrappedKey {
  iv: string;
  cipher: string;
  tag: string;
}

/** Legacy v1 — PBKDF2-derived key encrypts content directly (no envelope). */
export interface EncryptedPayloadV1 {
  v: 1;
  salt: string;
  iv: string;
  cipher: string;
  tag: string;
}

/** v2 — Argon2id master key + envelope-wrapped DEK + AES-256-GCM content (Layers 1 & 3). */
export interface EncryptedPayloadV2 {
  v: 2;
  kdf: KdfAlgorithm;
  kdfParams?: Argon2Params | Pbkdf2Params;
  salt: string;
  wrappedDek: WrappedKey;
  iv: string;
  cipher: string;
  tag: string;
}

export type EncryptedPayload = EncryptedPayloadV1 | EncryptedPayloadV2;

export function isLegacyPayload(payload: EncryptedPayload): payload is EncryptedPayloadV1 {
  return payload.v === 1;
}

export function isEnvelopePayload(payload: EncryptedPayload): payload is EncryptedPayloadV2 {
  return payload.v === 2;
}

export function getPayloadKdf(payload: EncryptedPayload): KdfAlgorithm {
  if (isEnvelopePayload(payload)) {
    return payload.kdf;
  }
  return 'pbkdf2';
}

async function getRandomBytes(length: number): Promise<Uint8Array> {
  const bytes = await Crypto.getRandomBytesAsync(length);
  return new Uint8Array(bytes);
}

async function aesGcmEncryptAsync(
  key: Uint8Array,
  plaintext: Uint8Array,
): Promise<{ iv: Uint8Array; cipher: Uint8Array; tag: Uint8Array }> {
  const iv = await getRandomBytes(IV_LENGTH);
  const aes = gcm(key, iv);
  const encrypted = aes.encrypt(plaintext);
  const cipher = encrypted.slice(0, encrypted.length - TAG_LENGTH);
  const tag = encrypted.slice(encrypted.length - TAG_LENGTH);
  return { iv, cipher, tag };
}

function aesGcmDecrypt(key: Uint8Array, iv: Uint8Array, cipher: Uint8Array, tag: Uint8Array): Uint8Array {
  const combined = new Uint8Array(cipher.length + tag.length);
  combined.set(cipher);
  combined.set(tag, cipher.length);
  const aes = gcm(key, iv);
  return aes.decrypt(combined);
}

export async function deriveMasterKey(
  password: string,
  salt: Uint8Array,
  kdf: KdfAlgorithm,
  params?: Argon2Params | Pbkdf2Params,
): Promise<Uint8Array> {
  const passwordBytes = new TextEncoder().encode(password);

  if (kdf === 'argon2id') {
    const argonParams = (params as Argon2Params | undefined) ?? ARGON2ID_DEFAULTS;
    return argon2id(passwordBytes, salt, {
      ...argonParams,
      dkLen: KEY_LENGTH,
      asyncTick: 10,
    });
  }

  const iterations =
    (params as Pbkdf2Params | undefined)?.iterations ?? PBKDF2_ITERATIONS;
  return pbkdf2Async(sha256, passwordBytes, salt, {
    c: iterations,
    dkLen: KEY_LENGTH,
  });
}

/** @deprecated Use deriveMasterKey — kept for call-site clarity during migration. */
export async function deriveKey(password: string, salt: Uint8Array): Promise<Uint8Array> {
  return deriveMasterKey(password, salt, 'pbkdf2', { iterations: PBKDF2_ITERATIONS });
}

async function wrapKey(masterKey: Uint8Array, dek: Uint8Array): Promise<WrappedKey> {
  const { iv, cipher, tag } = await aesGcmEncryptAsync(masterKey, dek);
  return {
    iv: bytesToBase64(iv),
    cipher: bytesToBase64(cipher),
    tag: bytesToBase64(tag),
  };
}

function unwrapKey(masterKey: Uint8Array, wrapped: WrappedKey): Uint8Array {
  const iv = base64ToBytes(wrapped.iv);
  const cipher = base64ToBytes(wrapped.cipher);
  const tag = base64ToBytes(wrapped.tag);
  return aesGcmDecrypt(masterKey, iv, cipher, tag);
}

export async function generateDek(): Promise<Uint8Array> {
  return getRandomBytes(KEY_LENGTH);
}

export async function createPasswordSalt(): Promise<Uint8Array> {
  return getRandomBytes(SALT_LENGTH);
}

export async function hashPasswordVerifier(password: string, salt: Uint8Array): Promise<string> {
  const material = new TextEncoder().encode(`${password}:${bytesToBase64(salt)}`);
  return bytesToBase64(sha256(material));
}

/** Build v2 envelope payload (Argon2id + per-blob DEK). Used for new vaults and upgrades. */
export async function encryptWithEnvelope(
  plaintext: string,
  password: string,
  salt?: Uint8Array,
): Promise<EncryptedPayloadV2> {
  const payloadSalt = salt ?? (await createPasswordSalt());
  const masterKey = await deriveMasterKey(password, payloadSalt, 'argon2id', ARGON2ID_DEFAULTS);
  try {
    const dek = await generateDek();
    try {
      const plaintextBytes = new TextEncoder().encode(plaintext);
      const { iv, cipher, tag } = await aesGcmEncryptAsync(dek, plaintextBytes);
      const wrappedDek = await wrapKey(masterKey, dek);
      return {
        v: 2,
        kdf: 'argon2id',
        kdfParams: { ...ARGON2ID_DEFAULTS },
        salt: bytesToBase64(payloadSalt),
        wrappedDek,
        iv: bytesToBase64(iv),
        cipher: bytesToBase64(cipher),
        tag: bytesToBase64(tag),
      };
    } finally {
      zeroize(dek);
    }
  } finally {
    zeroize(masterKey);
  }
}

/** Encrypt using an existing session DEK + master key (no KDF on hot path). */
export async function encryptWithSessionKeys(
  plaintext: string,
  masterKey: Uint8Array,
  dek: Uint8Array,
  salt: Uint8Array,
  kdf: KdfAlgorithm = 'argon2id',
  kdfParams: Argon2Params | Pbkdf2Params = { ...ARGON2ID_DEFAULTS },
): Promise<EncryptedPayloadV2> {
  const plaintextBytes = new TextEncoder().encode(plaintext);
  const { iv, cipher, tag } = await aesGcmEncryptAsync(dek, plaintextBytes);
  const wrappedDek = await wrapKey(masterKey, dek);
  return {
    v: 2,
    kdf,
    kdfParams,
    salt: bytesToBase64(salt),
    wrappedDek,
    iv: bytesToBase64(iv),
    cipher: bytesToBase64(cipher),
    tag: bytesToBase64(tag),
  };
}

export async function decryptPayload(
  payload: EncryptedPayload,
  password: string,
): Promise<{ plaintext: string; masterKey: Uint8Array; dek: Uint8Array; salt: Uint8Array }> {
  const salt = base64ToBytes(payload.salt);

  if (isLegacyPayload(payload)) {
    const masterKey = await deriveMasterKey(password, salt, 'pbkdf2', {
      iterations: PBKDF2_ITERATIONS,
    });
    const plaintext = await decryptDataWithKey(payload, masterKey);
    return { plaintext, masterKey, dek: masterKey, salt };
  }

  const kdf = payload.kdf;
  const masterKey = await deriveMasterKey(password, salt, kdf, payload.kdfParams);
  const dek = unwrapKey(masterKey, payload.wrappedDek);
  try {
    const iv = base64ToBytes(payload.iv);
    const cipher = base64ToBytes(payload.cipher);
    const tag = base64ToBytes(payload.tag);
    const decrypted = aesGcmDecrypt(dek, iv, cipher, tag);
    const plaintext = new TextDecoder().decode(decrypted);
    return { plaintext, masterKey, dek, salt };
  } catch (error) {
    zeroize(dek);
    zeroize(masterKey);
    throw error;
  }
}

/** Legacy direct-key encrypt (v1) — retained for tests and explicit legacy export if needed. */
export async function encryptData(plaintext: string, password: string): Promise<EncryptedPayloadV1> {
  const salt = await createPasswordSalt();
  const key = await deriveMasterKey(password, salt, 'pbkdf2', { iterations: PBKDF2_ITERATIONS });
  try {
    return encryptDataWithKey(plaintext, key, salt) as Promise<EncryptedPayloadV1>;
  } finally {
    zeroize(key);
  }
}

export async function encryptDataWithKey(
  plaintext: string,
  key: Uint8Array,
  salt: Uint8Array,
): Promise<EncryptedPayloadV1> {
  const iv = await getRandomBytes(IV_LENGTH);
  const plaintextBytes = new TextEncoder().encode(plaintext);
  const aes = gcm(key, iv);
  const encrypted = aes.encrypt(plaintextBytes);
  const cipher = encrypted.slice(0, encrypted.length - TAG_LENGTH);
  const tag = encrypted.slice(encrypted.length - TAG_LENGTH);

  return {
    v: 1,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    cipher: bytesToBase64(cipher),
    tag: bytesToBase64(tag),
  };
}

export async function decryptDataWithKey(
  payload: EncryptedPayloadV1 | Pick<EncryptedPayloadV1, 'iv' | 'cipher' | 'tag'>,
  key: Uint8Array,
): Promise<string> {
  const iv = base64ToBytes(payload.iv);
  const cipher = base64ToBytes(payload.cipher);
  const tag = base64ToBytes(payload.tag);
  const decrypted = aesGcmDecrypt(key, iv, cipher, tag);
  return new TextDecoder().decode(decrypted);
}

export async function decryptData(payload: EncryptedPayload, password: string): Promise<string> {
  const { plaintext } = await decryptPayload(payload, password);
  return plaintext;
}

/** HMAC-SHA256 integrity tag for `.totus` bundle export (Layer 3 tamper detection). */
export async function computeBundleHmac(contentJson: string, password: string): Promise<string> {
  const keyMaterial = new TextEncoder().encode(`${password}:totus-bundle-integrity-v1`);
  const hmacKey = sha256(keyMaterial);
  const digest = hmac(sha256, hmacKey, new TextEncoder().encode(contentJson));
  return bytesToBase64(digest);
}

export function verifyBundleHmac(contentJson: string, password: string, expectedHmac: string): Promise<boolean> {
  return computeBundleHmac(contentJson, password).then((computed) => computed === expectedHmac);
}
