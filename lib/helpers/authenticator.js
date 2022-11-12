'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { getRandomBytes, encryptString, decryptString } = require('./crypto');
const { Error } = require('../helpers/constant-texts').AUTHENTICATION;
const { CHILD_PROCESS_BASE_CONFIG_PATH } = require('../../config/project-configs');
const authCredetialsPath = path.resolve(CHILD_PROCESS_BASE_CONFIG_PATH, 'auth-info.txt');

const alphaNumericRegex = "^[a-zA-Z0-9_]*$";
const passwordRegex = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,16}$";

const validateCredentials = (username, password) => {
  let errMsg = '';
  let status = false;

  if (username && password) {
    if (username.length > 2) {
      if (username.match(alphaNumericRegex)) {
        if (password.match(passwordRegex)) {
          status = true;
        } else {
          errMsg = "Password doesn't satisfy the requirements. Please update your password based on the below password policy.\n\n* Password must contains one uppercase and one lowercase letter\n* Password must contains atleast one number and one special character\n* Password must be minimum of 8 characters and maximum of 16 characters";
        }
      } else {
        errMsg = 'Username must contains only alphabets & numbers';
      }
    } else {
      errMsg = 'Username must be minimum of 3 characters';
    }
  } else {
    errMsg = 'Username & password are required';
  }

  return { status, errMsg };
};

const getAuthInfo = () => {
  let auth = { status: false };
  if (fs.existsSync(authCredetialsPath)) {
    try {
      auth.info = JSON.parse(fs.readFileSync(authCredetialsPath));
      if (auth.info && auth.info.username && auth.info.password.length > 0 && auth.info.username && auth.info.password.length > 0) {
        auth.status = true;
      }
    } catch (err) {
      //Do nothing
    }
  }

  return auth;
};

const saveAuthInfo = (username, password) => {
  let authInfo = { status: false };
  try {
    const key = Buffer.from(getRandomBytes(32));
    const iv = Buffer.from(getRandomBytes(16));
    let encryptedUsername = encryptString(key, iv, username);
    let encryptedPassword = encryptString(key, iv, password);
    fs.writeFileSync(authCredetialsPath, JSON.stringify({ username: encryptedUsername, password: encryptedPassword, key, iv }));
    authInfo.status = true;
  } catch (err) {
    authInfo.err = err ? err.toString() : err;
  }

  return authInfo;
};

const verifyAuthInfo = (username, password) => {
  let authInfo = getAuthInfo();
  authInfo = authInfo && authInfo.info ? authInfo.info : null;
  let loginStatus = { status: false, err: '', data: {} };
  if (authInfo && authInfo.key && authInfo.iv && authInfo.username && authInfo.password) {
    console.log(authInfo)
    let decryptedUsername = decryptString(Buffer.from(authInfo.key), Buffer.from(authInfo.iv), username);
    console.log('decryptedUsername...', decryptedUsername)
    let decryptedPassword = decryptString(Buffer.from(authInfo.key), Buffer.from(authInfo.iv), password);
    console.log('decryptedPassword...', decryptedPassword)
    if (authInfo.username.toString().trim() === decryptedUsername.toString().trim() && authInfo.password.toString().trim() === decryptedPassword.toString().trim()) {
      let token = jwt.sign({ username }, Buffer.from(authInfo.key), { expiresIn: 3600 });
      loginStatus.data = { token };
      loginStatus.status = true;
    } else {
      loginStatus.err = Error.invalidInfo;
    }
  } else {
    loginStatus.err = Error.authNotEnabled;
  }

  return loginStatus;
};

module.exports = {
  validateCredentials, getAuthInfo, saveAuthInfo, verifyAuthInfo
};