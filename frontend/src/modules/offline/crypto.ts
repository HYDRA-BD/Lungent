/**
 * Client-Side Storage Encryption Utility
 * Phase 1.21 — Limited Offline Functionality
 *
 * Employs Web Crypto API AES-GCM 256-bit envelope encryption for structured draft storage.
 * Does not store keys alongside plaintext records or persist server credentials.
 * Persists the non-extractable CryptoKey in an isolated IndexedDB keystore across page reloads.
 */

const ENCRYPTION_ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const IV_LENGTH_BYTES = 12

// Per-device local keystore cache in memory
let cachedCryptoKey: CryptoKey | null = null

async function loadPersistedKey(): Promise<CryptoKey | null> {
  if (typeof window === 'undefined' || !window.indexedDB) return null
  try {
    return await new Promise<CryptoKey | null>((resolve) => {
      const req = window.indexedDB.open('lungent_keystore', 1)
      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains('keys')) {
          db.createObjectStore('keys', { keyPath: 'id' })
        }
      }
      req.onsuccess = () => {
        const db = req.result
        try {
          const tx = db.transaction('keys', 'readonly')
          const store = tx.objectStore('keys')
          const getReq = store.get('aes_key')
          getReq.onsuccess = () => resolve(getReq.result?.key || null)
          getReq.onerror = () => resolve(null)
        } catch {
          resolve(null)
        }
      }
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

async function persistKey(key: CryptoKey): Promise<void> {
  if (typeof window === 'undefined' || !window.indexedDB) return
  try {
    await new Promise<void>((resolve) => {
      const req = window.indexedDB.open('lungent_keystore', 1)
      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains('keys')) {
          db.createObjectStore('keys', { keyPath: 'id' })
        }
      }
      req.onsuccess = () => {
        const db = req.result
        try {
          const tx = db.transaction('keys', 'readwrite')
          const store = tx.objectStore('keys')
          const putReq = store.put({ id: 'aes_key', key })
          putReq.onsuccess = () => resolve()
          putReq.onerror = () => resolve()
        } catch {
          resolve()
        }
      }
      req.onerror = () => resolve()
    })
  } catch {
    // Suppress
  }
}

/**
 * Returns or generates a non-extractable client-side CryptoKey for AES-GCM encryption.
 */
export async function getOrCreateStorageKey(): Promise<CryptoKey> {
  if (cachedCryptoKey) {
    return cachedCryptoKey
  }

  // Try to load persisted key across page reloads
  const persisted = await loadPersistedKey()
  if (persisted) {
    cachedCryptoKey = persisted
    return cachedCryptoKey
  }

  const subtle = globalThis.crypto?.subtle
  if (!subtle) {
    throw new Error('Web Crypto API is unavailable in this environment')
  }

  // Generate an ephemeral non-extractable AES-GCM key scoped to the active browser instance
  cachedCryptoKey = await subtle.generateKey(
    {
      name: ENCRYPTION_ALGORITHM,
      length: KEY_LENGTH,
    },
    false, // non-extractable to prevent extraction via script inspection
    ['encrypt', 'decrypt']
  )

  await persistKey(cachedCryptoKey)
  return cachedCryptoKey
}

export interface EncryptedEnvelope {
  iv: string // Base64 encoded
  ciphertext: string // Base64 encoded
  algorithm: string
  encryptedAt: string
}

/**
 * Encrypts a serializable object into an EncryptedEnvelope.
 */
export async function encryptDraftData<T>(data: T): Promise<EncryptedEnvelope> {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) {
    throw new Error('Web Crypto API is unavailable for secure offline encryption')
  }

  const key = await getOrCreateStorageKey()
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_LENGTH_BYTES))
  const plaintextBuffer = new TextEncoder().encode(JSON.stringify(data))

  const ciphertextBuffer = await subtle.encrypt(
    {
      name: ENCRYPTION_ALGORITHM,
      iv,
    },
    key,
    plaintextBuffer
  )

  return {
    iv: arrayBufferToBase64(iv.buffer),
    ciphertext: arrayBufferToBase64(ciphertextBuffer),
    algorithm: 'AES-GCM-256',
    encryptedAt: new Date().toISOString(),
  }
}

/**
 * Decrypts an EncryptedEnvelope back into original typed object.
 */
export async function decryptDraftData<T>(envelope: EncryptedEnvelope): Promise<T> {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) {
    throw new Error('Web Crypto API is unavailable for secure offline decryption')
  }

  const key = await getOrCreateStorageKey()
  const iv = base64ToArrayBuffer(envelope.iv)
  const ciphertext = base64ToArrayBuffer(envelope.ciphertext)

  const decryptedBuffer = await subtle.decrypt(
    {
      name: ENCRYPTION_ALGORITHM,
      iv: new Uint8Array(iv),
    },
    key,
    ciphertext
  )

  const jsonString = new TextDecoder().decode(decryptedBuffer)
  return JSON.parse(jsonString) as T
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}
