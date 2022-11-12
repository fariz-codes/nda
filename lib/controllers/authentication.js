'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const { _redirectToAuthentication, _redirect } = require('../models/redirector');
const { verifyAuthInfo } = require('../helpers/authenticator');

const _login = (req, res) => {
  let authStatus = verifyAuthInfo(req.body.username, req.body.password);
  if (authStatus.status) {
    _redirect('/', res);
  } else {
    _redirectToAuthentication({ errMsg: authStatus.err }, res);
  }
};

const _getLoginUI = (req, res) => {
  _redirectToAuthentication({ successMsg: '', errMsg: '' }, res);
};

module.exports = {
  _login, _getLoginUI
};