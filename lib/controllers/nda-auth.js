'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const { _redirectToAuthErr, _redirectToDashboard } = require('../models/redirector');
const { writeLog } = require('../helpers/log-writer');
const jwt = require('jsonwebtoken');
const { authSecret, authUserName } = require('../../config/project-configs');
const { verifyOtp } = require('../helpers/utilities');

const _login = (req, res) => {
  try {
    const { password, otp } = req.body;
    const isVerified = verifyOtp(password, otp);
    if (isVerified) {
      const accessToken = jwt.sign({ name: authUserName }, authSecret, { expiresIn: 60 * 60 }); //jwt.verify(token, authSecret);
      res.cookie('accessToken', accessToken, {
        maxAge: 3600000,
        httpOnly: true,
        secure: false,
        sameSite: 'Strict',
        path: '/'
      });
      res.json({ success: 'Authentication success.'});
    } else {
      throw Error('Invalid credentials.');
    }
  } catch (error) {
    res.status(401).json({ error });
    writeLog(null, 500, error, '_2');
  }
};

module.exports = {
  _login
};