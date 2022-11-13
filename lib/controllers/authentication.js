'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const { _redirectToAuthentication, _redirect } = require('../models/redirector');
const { verifyAuthInfo } = require('../helpers/authenticator');

const _login = (req, res) => {
  let authStatus = verifyAuthInfo(req.body.username, req.body.password);
  const apiPath = req.body['redirect-path'];
  if (authStatus.status) {
    let token = authStatus.data && authStatus.data.token ? authStatus.data.token : null;
    let redirectionPath = apiPath.indexOf('?') > -1 ? `${apiPath}&token=${token}` : `${apiPath}?token=${token}`;
    _redirect(redirectionPath, res);
  } else {
    _redirectToAuthentication({ errMsg: authStatus.err, redirectPath: apiPath }, res);
  }
};

const _getLoginUI = (req, res) => {
  _redirectToAuthentication({ errMsg: '', redirectPath: '/' }, res);
};

module.exports = {
  _login, _getLoginUI
};