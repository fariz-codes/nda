'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const crypto = require('crypto');

const algorithm = "aes256";

const getRandomBytes = (length) => {
  return crypto.randomBytes(length);
};

const encryptString = (key, iv, string) => {
  let encryption = crypto.createCipheriv(algorithm, key, iv);
  return encryption.update(string, 'utf8', 'hex') + encryption.final('hex');
};

const decryptString = (key, iv, encryptedString) => {
  let decryption = crypto.createDecipheriv(algorithm, key, iv);
  return decryption.update(encryptedString, 'hex', 'utf8') + decryption.final('utf8');
};

module.exports = {
  getRandomBytes, encryptString, decryptString
};