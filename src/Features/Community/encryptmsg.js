
function base64ToUint8Array(base64) {
  try {
    if (!base64 || typeof base64 !== 'string') {
      return null;
    }

    base64 = base64.trim().replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch (err) {
    console.error("Failed to decode Base64:", err);
    return null;
  }
}

/**
 * Get AES key from base64 secret
 */
async function getAESKey(secretBase64) {
  const keyBytes = base64ToUint8Array(secretBase64);
  if (!keyBytes || keyBytes.length !== 32) {
    throw new Error("Invalid secret key - must be 32 bytes");
  }

  return await window.crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * ENCRYPT MESSAGE
 * @param {string} message - Plain text to encrypt
 * @param {string} secretBase64 - Base64 encoded 32-byte key
 * @returns {Promise<{cipherText: string, iv: string, authTag: string}>}
 */
export async function encryptMessage(message, secretBase64) {
  if (!message) throw new Error("Message is required");
  if (!secretBase64) throw new Error("Secret key is required");

  const key = await getAESKey(secretBase64);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(message)
  );

  const fullBytes = new Uint8Array(encryptedBuffer);
  const cipherTextBytes = fullBytes.slice(0, -16);
  const authTagBytes = fullBytes.slice(-16);

  return {
    cipherText: btoa(String.fromCharCode(...cipherTextBytes)),
    iv: btoa(String.fromCharCode(...iv)),
    authTag: btoa(String.fromCharCode(...authTagBytes))
  };
}

/**
 * DECRYPT MESSAGE
 * @param {Object} payload - {cipherText, iv, authTag}
 * @param {string} secretBase64 - Base64 encoded 32-byte key
 * @returns {Promise<string>} Decrypted message
 */
export async function decryptMessage(payload, secretBase64) {
  if (!payload?.cipherText || !payload?.iv || !payload?.authTag) {
    console.error("Invalid payload - missing fields");
    return "[Encrypted]";
  }

  if (!secretBase64) {
    console.error("No secret key provided");
    return "[Encrypted]";
  }

  try {
    const key = await getAESKey(secretBase64);
    const iv = base64ToUint8Array(payload.iv);
    const cipherBytes = base64ToUint8Array(payload.cipherText);
    const authTag = base64ToUint8Array(payload.authTag);

    if (!iv || !cipherBytes || !authTag) {
      console.error("Failed to decode payload");
      return "[Encrypted]";
    }

    const encryptedBuffer = new Uint8Array([...cipherBytes, ...authTag]);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encryptedBuffer
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (err) {
    console.error("Decryption failed:", err);
    return "[Encrypted]";
  }
}