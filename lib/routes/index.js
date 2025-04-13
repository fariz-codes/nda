'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const express = require('express');
const router = express.Router();
const { _redirectToAuthErr } = require('../models/redirector');
const whiteListedBasePaths = ['/images', '/auth/login'];

const authHandler = (req, res, next) => {
    let reqBasePath = req.originalUrl.split('?')[0];
    let cookies = req.headers && req.headers.cookie ? req.headers.cookie : "";
    if (whiteListedBasePaths.indexOf(reqBasePath) < 0 && cookies.indexOf('accessToken') < 0) {
        _redirectToAuthErr({}, res);
    } else {
        next();
    }
};

router.use('*', authHandler);
router.use('/process', require('./api/process'));
router.use('/logs', require('./api/logs'));
router.use('/nda-config', require('./api/nda-config'));
router.use('/auth', require('./api/nda-auth'));
router.use('/', require('./api/dashboard'));

module.exports = router;
