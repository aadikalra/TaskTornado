import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

function encryptionKey() {
  const value = process.env.AI_KEY_ENCRYPTION_KEY;
  if (!value || !/^[a-fA-F0-9]{64}$/.test(value)) {
    throw new Error('Personal AI keys are not configured on this server.');
  }
  return Buffer.from(value, 'hex');
}

export function hasAiKeyEncryption() {
  return /^[a-fA-F0-9]{64}$/.test(process.env.AI_KEY_ENCRYPTION_KEY || '');
}

export function encryptAiKey(value: string, accountContext: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  cipher.setAAD(Buffer.from(accountContext));
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return ['v1', iv.toString('base64'), cipher.getAuthTag().toString('base64'), encrypted.toString('base64')].join('.');
}

export function decryptAiKey(value: string, accountContext: string) {
  const [version, iv, tag, encrypted, extra] = value.split('.');
  if (version !== 'v1' || !iv || !tag || !encrypted || extra) throw new Error('Invalid encrypted AI key.');
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(iv, 'base64'));
  decipher.setAAD(Buffer.from(accountContext));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64')), decipher.final()]).toString('utf8');
}
