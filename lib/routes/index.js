'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const express = require('express');
const router = express.Router();
const { validateAuth } = require('./validator/authentication');

router.use('/authentication', require('./api/authentication'));
router.use('/process', validateAuth, require('./api/process'));
router.use('/logs', validateAuth, require('./api/logs'));
router.use('/nda-config', validateAuth, require('./api/nda-config'));
router.use('/', validateAuth, require('./api/dashboard'));

module.exports = router;
