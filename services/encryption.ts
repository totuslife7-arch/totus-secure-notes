import { gcm } from '@noble/ciphers/aes.js';
import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import * as Crypto from 'expo-crypto';

import { base64ToBytes, bytesToBase64 } from '@/utils/base64';

export const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

export interface EncryptedPayload {
  v: 1;
  salt: string;
  iv: string;
  cipher: string;
  tag: string;
}

async function getRandomBytes(length: number): Promise<Uint8Array> {
  const bytes = await Crypto.getRandomBytesAsync(length);
  return new Uint8Array(bytes);
}

export async function deriveKey(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const passwordBytes = new TextEncoder().encode(password);
  return pbkdf2Async(sha256, passwordBytes, salt, {
    c: PBKDF2_ITERATIONS,
    dkLen: KEY_LENGTH,
  });
}

export async function encryptData(plaintext: string, password: string): Promise<EncryptedPayload> {
  const salt = await getRandomBytes(SALT_LENGTH);
  const iv = await getRandomBytes(IV_LENGTH);
  const key = await deriveKey(password, salt);
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

export async function decryptData(payload: EncryptedPayload, password: string): Promise<string> {
  const salt = base64ToBytes(payload.salt);
  const iv = base64ToBytes(payload.iv);
  const cipher = base64ToBytes(payload.cipher);
  const tag = base64ToBytes(payload.tag);
  const key = await deriveKey(password, salt);

  const combined = new Uint8Array(cipher.length + tag.length);
  combined.set(cipher);
  combined.set(tag, cipher.length);

  const aes = gcm(key, iv);
  const decrypted = aes.decrypt(combined);
  return new TextDecoder().decode(decrypted);
}

export async function hashPasswordVerifier(password: string, salt: Uint8Array): Promise<string> {
  const material = new TextEncoder().encode(`${password}:${bytesToBase64(salt)}`);
  return bytesToBase64(sha256(material));
}

export async function createPasswordSalt(): Promise<Uint8Array> {
  return getRandomBytes(SALT_LENGTH);
}
