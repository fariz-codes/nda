'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const router = require('express').Router();
const controller = require('../../controllers/nda-auth.js');
const validate = require('../validator/nda-auth.js')

/*
 * Authenticate user
 */
router.post('/login', validate.login, controller._login);

router.post('/logout', controller._logout);

module.exports = router;