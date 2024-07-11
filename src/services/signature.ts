import crypto from 'crypto-browserify';

const key = process.env.REACT_APP_CRYPTO_KEY;

export const getSignature = (plaintext: string) => {
  if (!key) return;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(plaintext, 'utf-8', 'base64');
  encrypted += cipher.final('base64');
  return iv.toString('base64') + encrypted;
};

export const getAuthenticationHeaders = (path) => {
  const time = Math.round(new Date().getTime() / 1000);
  const o = { path, time };
  const str = JSON.stringify(o);
  const signature = getSignature(str);
  return {
    Authentication: signature,
  };
};
