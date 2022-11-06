'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const { _redirectToAuthentication } = require('../models/redirector');
const { verifyAuthInfo } = require('../helpers/authenticator');

const _login = (req, res) => {
  let authStatus = verifyAuthInfo(req.body.username, req.body.password);
  if (authStatus.status) {
    res.json(authStatus.data);
  } else {
    res.json(401);
    return res.json(authStatus.err);
  }
};

const _getLoginUI = (req, res) => {
  _redirectToAuthentication({ successMsg: '', errMsg: '' }, res);
};

module.exports = {
  _login, _getLoginUI
};