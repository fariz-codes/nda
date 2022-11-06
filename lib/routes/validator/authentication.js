'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const { validateCredentials } = require('../../helpers/authenticator');

const validateLogin = (req, res, next) => {
  const { username, password } = req.body;
  let validation = validateCredentials(username, password);
  if (validation.status) {
    next();
  } else {
    res.status(400);
    return res.json(validation.errMsg);
  }
};

module.exports = {
  validateLogin
};