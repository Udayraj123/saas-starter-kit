import crypto from 'crypto';
import seed from 'random-bytes-seed';
import { getCurrentOtp } from './otp';
import { API_RESPONSE_MESSAGES } from '../constants';
import { ApiKeyUsageError } from './validation';

const { INVALID_API_KEY_2FA } = API_RESPONSE_MESSAGES;
// derived from: https://www.tutorialspoint.com/encrypt-and-decrypt-data-in-nodejs
const encryptUtil = (text, key, iv) => {
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
};

export const encryptBody = (body) => {
  const otp = getCurrentOtp();
  const randomBytes = seed(otp);
  const key = randomBytes(32);
  const iv = randomBytes(16);
  const bodyText = JSON.stringify(body);
  return encryptUtil(bodyText, key, iv);
};

const decryptUtil = (body, key) => {
  const { encryptedData, iv: ivHex } = body;
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encryptedData, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

export const decryptBody = (body) => {
  const otp = getCurrentOtp();
  const randomBytes = seed(otp);
  const key = randomBytes(32);
  try {
    const bodyText = decryptUtil(body, key);
    return JSON.parse(bodyText);
  } catch (e) {
    throw new ApiKeyUsageError(INVALID_API_KEY_2FA);
  }
};
