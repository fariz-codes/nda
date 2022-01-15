'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const router = require('express').Router();
const controller = require('../../controllers/process');
const { _addProcess, _pidCheck } = require('../validator/process');

/*
 * Get view to add a project
 */
router.get('/add', controller._addForm);

/*
 * Store project info
 */
router.get('/add-process', _addProcess, controller._store);

/*
 * Start project
 */
router.get('/start', controller._start);

/*
 * Stop project
 */
router.get('/stop', _pidCheck, controller._stop);

/*
 * Delete project
 */
router.get('/delete', controller._delete);

/*
 * Restart project
 */
router.get('/restart', _pidCheck, controller._restart);

/*
 * Stop all projects
 */
router.get('/stop-all', controller._stopAll);

module.exports = router;