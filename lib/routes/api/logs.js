'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const router = require('express').Router();
const controller = require('../../controllers/logs');

/*
 * Get project logs
 */
router.get('/', controller._logs);

/*
 * Get project logs content
 */
router.get('/content', controller._logContent);

/*
 * Get project logs list
 */
router.get('/list', controller._list);

/*
 * Delete project log file
 */
router.get('/remove', controller._deleteLogFile);

module.exports = router;