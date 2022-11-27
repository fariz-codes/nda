'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const { _redirectToAuthentication, _redirect } = require('../models/redirector');
const { verifyAuthInfo } = require('../helpers/authenticator');
const { Error } = require('../helpers/constant-texts').AUTHENTICATION;

const _login = (req, res) => {
  let authStatus = verifyAuthInfo(req.body.username, req.body.password);
  if (authStatus.status) {
    let token = authStatus.data && authStatus.data.token ? authStatus.data.token : null;
    res.json({ token });
  } else {
    res.status(401).json({ msg: Error.invalidInfo });
  }
};

const _getLoginUI = (req, res) => {
  _redirectToAuthentication({ errMsg: '', redirectPath: '/' }, res);
};

module.exports = {
  _login, _getLoginUI
};