'use strict';

const express = require('express');
const router = express.Router();

router.use('/process', require('./api/process'));
router.use('/logs', require('./api/logs'));
router.use('/', require('./api/dashboard'));

module.exports = router;
