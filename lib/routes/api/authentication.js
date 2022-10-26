'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const router = require('express').Router();
const controller = require('../../controllers/authentication');

/*
 * Get authentication UI
 */
router.get('/', controller._login);

module.exports = router;