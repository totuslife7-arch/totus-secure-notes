const BASE64_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function bytesToBase64(bytes: Uint8Array): string {
  let result = '';
  const len = bytes.length;

  for (let i = 0; i < len; i += 3) {
    const a = bytes[i];
    const b = i + 1 < len ? bytes[i + 1] : 0;
    const c = i + 2 < len ? bytes[i + 2] : 0;

    const triplet = (a << 16) | (b << 8) | c;
    result += BASE64_CHARS[(triplet >> 18) & 63];
    result += BASE64_CHARS[(triplet >> 12) & 63];
    result += i + 1 < len ? BASE64_CHARS[(triplet >> 6) & 63] : '=';
    result += i + 2 < len ? BASE64_CHARS[triplet & 63] : '=';
  }

  return result;
}

export function base64ToBytes(base64: string): Uint8Array {
  const sanitized = base64.replace(/[^A-Za-z0-9+/=]/g, '');
  const padding = sanitized.endsWith('==') ? 2 : sanitized.endsWith('=') ? 1 : 0;
  const byteLength = (sanitized.length * 3) / 4 - padding;
  const bytes = new Uint8Array(byteLength);

  let byteIndex = 0;
  for (let i = 0; i < sanitized.length; i += 4) {
    const enc1 = BASE64_CHARS.indexOf(sanitized[i]);
    const enc2 = BASE64_CHARS.indexOf(sanitized[i + 1]);
    const enc3 = BASE64_CHARS.indexOf(sanitized[i + 2]);
    const enc4 = BASE64_CHARS.indexOf(sanitized[i + 3]);

    const triplet = (enc1 << 18) | (enc2 << 12) | ((enc3 & 63) << 6) | (enc4 & 63);

    if (byteIndex < byteLength) bytes[byteIndex++] = (triplet >> 16) & 255;
    if (byteIndex < byteLength) bytes[byteIndex++] = (triplet >> 8) & 255;
    if (byteIndex < byteLength) bytes[byteIndex++] = triplet & 255;
  }

  return bytes;
}
