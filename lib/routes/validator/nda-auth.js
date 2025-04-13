'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const { _redirectToAuthErr } = require('../../models/redirector');

const login = (req, res, next) => {
  if (req.body.password && req.body.otp) {
    return next();
  }
  return _redirectToAuthErr({errMsg: "Auth password & otp are required"}, res);
};

module.exports = {
  login
};