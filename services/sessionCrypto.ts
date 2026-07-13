import {

  Argon2Params,

  createPasswordSalt,

  decryptPayload,

  EncryptedPayload,

  encryptWithEnvelope,

  encryptWithSessionKeys,

  getPayloadKdf,

  isLegacyPayload,

  Pbkdf2Params,

} from '@/services/encryption';

import { clearSessionDek, storeSessionDek } from '@/services/keyWrap';

import { base64ToBytes, bytesToBase64 } from '@/utils/base64';

import { zeroize } from '@/utils/zeroize';



interface SessionVaultCrypto {

  password: string;

  masterKey: Uint8Array;

  dek: Uint8Array;

  salt: Uint8Array;

  kdfParams: Argon2Params | Pbkdf2Params;

}



let sessionCrypto: SessionVaultCrypto | null = null;



function zeroizeSession(): void {

  if (sessionCrypto) {

    zeroize(sessionCrypto.masterKey);

    zeroize(sessionCrypto.dek);

    sessionCrypto = null;

  }

}



export async function primeSessionVaultCrypto(

  password: string,

  payload: EncryptedPayload,

): Promise<void> {

  zeroizeSession();

  const { masterKey, dek, salt } = await decryptPayload(payload, password);



  const kdf = getPayloadKdf(payload);

  const kdfParams =

    !isLegacyPayload(payload) && payload.kdfParams

      ? payload.kdfParams

      : kdf === 'argon2id'

        ? { t: 3, m: 16384, p: 1 }

        : { iterations: 100_000 };



  sessionCrypto = { password, masterKey, dek, salt, kdfParams };

  await storeSessionDek(dek);

}



export async function clearSessionVaultCrypto(): Promise<void> {

  zeroizeSession();

  await clearSessionDek();

}



export async function encryptVaultJson(

  plaintext: string,

  password: string,

): Promise<EncryptedPayload> {

  if (sessionCrypto?.password === password) {

    const { masterKey, dek, salt, kdfParams } = sessionCrypto;

    return encryptWithSessionKeys(plaintext, masterKey, dek, salt, 'argon2id', kdfParams);

  }



  return encryptWithEnvelope(plaintext, password);

}



export async function decryptVaultJson(

  payload: EncryptedPayload,

  password: string,

): Promise<string> {

  if (sessionCrypto?.password === password) {

    const { dek } = sessionCrypto;

    if (isLegacyPayload(payload)) {

      const { decryptDataWithKey } = await import('@/services/encryption');

      return decryptDataWithKey(payload, dek);

    }

    const iv = base64ToBytes(payload.iv);

    const cipher = base64ToBytes(payload.cipher);

    const tag = base64ToBytes(payload.tag);

    const { gcm } = await import('@noble/ciphers/aes.js');

    const combined = new Uint8Array(cipher.length + tag.length);

    combined.set(cipher);

    combined.set(tag, cipher.length);

    const aes = gcm(dek, iv);

    const decrypted = aes.decrypt(combined);

    return new TextDecoder().decode(decrypted);

  }



  const { plaintext } = await decryptPayload(payload, password);

  await primeSessionVaultCrypto(password, payload);

  return plaintext;

}



/** Encrypt raw bytes (attachments) with session vault key. */

export async function encryptBytesWithSessionKey(

  data: Uint8Array,

  password: string,

): Promise<EncryptedPayload> {

  return encryptVaultJson(bytesToBase64(data), password);

}



export async function decryptBytesWithSessionKey(

  payload: EncryptedPayload,

  password: string,

): Promise<Uint8Array> {

  const b64 = await decryptVaultJson(payload, password);

  return base64ToBytes(b64);

}



/** Re-wrap session keys after master password change. */

export async function refreshSessionAfterPasswordChange(

  password: string,

  payload: EncryptedPayload,

): Promise<void> {

  await clearSessionVaultCrypto();

  await primeSessionVaultCrypto(password, payload);

}



export async function ensureSessionSalt(password: string): Promise<Uint8Array> {

  if (sessionCrypto?.password === password) {

    return sessionCrypto.salt;

  }

  return createPasswordSalt();

}


