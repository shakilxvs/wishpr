// End-to-end encryption using browser's built-in Web Crypto API. Free, no library.

export async function generateEncryptionKey(): Promise<string> {
  const key  = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
  const raw  = await crypto.subtle.exportKey('raw', key)
  return btoa(String.fromCharCode(...new Uint8Array(raw)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function importKey(b64: string): Promise<CryptoKey> {
  const fixed = b64.replace(/-/g, '+').replace(/_/g, '/')
  const padded = fixed.padEnd(fixed.length + ((4 - fixed.length % 4) % 4), '=')
  const raw = Uint8Array.from(atob(padded), c => c.charCodeAt(0))
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
}

export async function encryptMessage(text: string, keyB64: string): Promise<string> {
  const key  = await importKey(keyB64)
  const iv   = crypto.getRandomValues(new Uint8Array(12))
  const enc  = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(text))
  const combined = new Uint8Array(12 + enc.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(enc), 12)
  return btoa(String.fromCharCode(...combined))
}

export async function decryptMessage(encB64: string, keyB64: string): Promise<string | null> {
  try {
    const key  = await importKey(keyB64)
    const data = Uint8Array.from(atob(encB64), c => c.charCodeAt(0))
    const dec  = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: data.slice(0, 12) }, key, data.slice(12))
    return new TextDecoder().decode(dec)
  } catch {
    return null
  }
}
