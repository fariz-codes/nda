'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const path = require('path');
const router = require('express').Router();
const controller = require('../../controllers/dashboard');

/*
 * Get image files
 */
router.get('/images', (req, res) => {
  res.sendFile(path.join(__dirname, '../../images', req.query.name));
});

/*
 * Get error codes
 */
router.get('/error-codes', controller._errorCodes);

/*
 * Load dashboard
 */
router.get('/', controller._load);

/*
 * Update dashboard fields
 */
router.get('/update-fields', controller._update);

module.exports = router;