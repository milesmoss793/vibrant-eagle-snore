import CryptoJS from 'crypto-js';

/**
 * Encrypts a string using AES with a provided key.
 */
export const encryptData = (data: string, key: string): string => {
  if (!key) return data;
  return CryptoJS.AES.encrypt(data, key).toString();
};

/**
 * Decrypts an AES encrypted string. Returns null if decryption fails.
 */
export const decryptData = (ciphertext: string, key: string): string | null => {
  if (!key) return ciphertext;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || null;
  } catch (error) {
    return null;
  }
};

/**
 * Helper to check if a string is valid JSON.
 * Used to detect if data is already encrypted or still plain text.
 */
export const isJson = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};