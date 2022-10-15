'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const router = require('express').Router();
const controller = require('../../controllers/nda-config');
const validate = require('../validator/nda-config.js')

/*
 * Get view for nda configurations
 */
router.get('/', validate.sslIntegration, controller._getConfig);

module.exports = router;