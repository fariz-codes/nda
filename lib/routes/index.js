'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { _redirectToAuthErr } = require('../models/redirector');
const whiteListedBasePaths = ['/images', '/auth/login'];
const { authSecret } = require('../../config/project-configs');

const authHandler = (req, res, next) => {
    try {
        let reqBasePath = req.originalUrl.split('?')[0];
        let cookies = req.headers && req.headers.cookie ? req.headers.cookie : "";
        let accessToken = cookies.indexOf('accessToken') > -1 ? cookies.split('accessToken=')[1] : null;
        if (whiteListedBasePaths.indexOf(reqBasePath) < 0 && !accessToken) {
            _redirectToAuthErr({}, res);
        } else if (accessToken) {
            let decoded = accessToken ? jwt.verify(accessToken, authSecret) : null;
            if (decoded) {
                res.decoded = decoded;
                next();
            } else {
                _redirectToAuthErr({}, res);
            }
        } else {
            next();
        }
    } catch (err) {
        _redirectToAuthErr({}, res);
    }
};

router.use('*', authHandler);
router.use('/process', require('./api/process'));
router.use('/logs', require('./api/logs'));
router.use('/nda-config', require('./api/nda-config'));
router.use('/auth', require('./api/nda-auth'));
router.use('/', require('./api/dashboard'));

module.exports = router;
