'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const jwt = require('jsonwebtoken');
const { getAuthInfo } = require('../../helpers/authenticator');
const { _redirectToAuthentication } = require('../../models/redirector');
const { Error } = require('../../helpers/constant-texts').AUTHENTICATION;

const validateLoginParams = (req, res, next) => {
  const { username, password } = req.body;
  if (username && password) {
    return next();
  }

  return _redirectToAuthentication({ errMsg: 'username & password are required', redirectPath: '/' }, res);
};

const validateAuth = (req, res, next) => {
  const apiPath = req.originalUrl;
  const headers = req.headers;
  let errMsg = Error.headersRequired;
  if (headers.authorization || req.query.token) {
    let token = req.query.token ? req.query.token.split('Bearer ') : headers.authorization.split('Bearer ');
    if (token && token[0]) {
      let authToken = token[0].trim();
      console.log('authToken...', authToken)
      let authInfo = getAuthInfo();
      authInfo = authInfo && authInfo.info ? authInfo.info : null;
      if (authInfo && authInfo.key) {
        console.log('authInfo...', authInfo)
        try {
          let decoded = jwt.verify(authToken, Buffer.from(authInfo.key));
          console.log('decoded...', decoded)
          if (decoded) {
            req.tokenInfo = decoded;
            req.authToken = authToken;
            return next();
          }
        } catch (err) {
          console.log(err)
          //Do nothing.
        }
        errMsg = Error.invalidToken;
      }
    }
  }

  return _redirectToAuthentication({ errMsg, redirectPath: apiPath }, res);
};

module.exports = {
  validateLoginParams, validateAuth
};