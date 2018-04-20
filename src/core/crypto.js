import crypto, { pbkdf2, pbkdf2Sync } from 'crypto';

const digest = 'sha512';
const iterations = 2048;
const keyLength = 32;

export default {
  hash: async (password) => {
    try {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = pbkdf2Sync(password, salt, iterations, keyLength, digest).toString('hex');
      return [salt, hash].join('$');
    } catch (error) {
      return error;
    }
  },
  verify: async (password, registeredHash) => {
    try {
      const regHash = registeredHash.split('$')[1];
      const salt = registeredHash.split('$')[0];
      const hash = pbkdf2Sync(password, salt, iterations, keyLength, digest).toString('hex');
      if (hash === regHash) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return error;
    }
  }
}
