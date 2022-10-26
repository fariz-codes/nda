'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const express = require('express');
const router = express.Router();
const authenticator = require('../helpers/authenticator');

router.use('/process', require('./api/process'));
router.use('/logs', require('./api/logs'));
router.use('/nda-config', require('./api/nda-config'));
router.use('/authentication', require('./api/authentication'));
router.use('/', authenticator.validate, require('./api/dashboard'));

module.exports = router;
