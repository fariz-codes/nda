'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const { getAuthInfo } = require('../../helpers/authenticator');
const { _redirectToAuthentication } = require('../../models/redirector');
const { Error } = require('../../helpers/constant-texts').AUTHENTICATION;

const validateLoginParams = (req, res, next) => {
  const { username, password } = req.body;
  if (username && password) {
    return next();
  }

  return _redirectToAuthentication({ errMsg: 'username & password are required' }, res);
};

const validateAuth = (req, res, next) => {
  const headers = req.headers;
  let errMsg = Error.headersRequired;
  if (headers.authorization) {
    let token = headers.authorization.split('Bearer ');
    if (token) {
      let authInfo = getAuthInfo();
      if (authInfo && authInfo.key) {
        try {
          let decoded = jwt.verify(token, Buffer.from(authInfo.key));
          if (decoded) {
            return next();
          }
        } catch (err) {
          //Do nothing.
        }
        errMsg = Error.invalidToken;
      }
    }
  }

  return _redirectToAuthentication({ errMsg }, res);
};

module.exports = {
  validateLoginParams, validateAuth
};