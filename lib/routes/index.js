'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const express = require('express');
const router = express.Router();
const { _redirectToAuthErr } = require('../models/redirector');

const authHandler = (req, res, next) => {
    if (!req.headers.cookies) {
        _redirectToAuthErr({}, res);
    } else {
        next();
    }
};

router.use('*', authHandler)
router.use('/process', require('./api/process'));
router.use('/logs', require('./api/logs'));
router.use('/nda-config', require('./api/nda-config'));
router.use('/', require('./api/dashboard'));

module.exports = router;
