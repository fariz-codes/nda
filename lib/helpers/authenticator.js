const fs = require('fs');
const path = require('path');

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
    fs.writeFileSync(authCredetialsPath, JSON.stringify({ username, password }));
    authInfo.status = true;
  } catch (err) {
    authInfo.err = err ? err.toString() : err;
  }

  return authInfo;
};

module.exports = {
  validateCredentials, getAuthInfo, saveAuthInfo
};