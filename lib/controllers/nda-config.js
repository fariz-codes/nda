'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const os = require('os');
const { _redirectToEditConfig, _redirect } = require('../models/redirector');
const startOnBoot = require('start-on-boot');
const { writeLog } = require('../helpers/log-writer');

const _getConfig = (req, res) => {
  try {
    let view = req.query.view ? true : false;
    let isLinux = os.type().indexOf('Windows') > -1 ? false : true;

    if (view) {
      let result = startOnBoot.getStatus(isLinux);
      _redirectToEditConfig(result, res);
    } else {
      let result;
      if (req.query && req.query.startonbootchk === 'on') {
        result = startOnBoot.enable(isLinux);
      } else {
        result = startOnBoot.disable(isLinux);
      }
      if (result && result.err) {
        _redirectToEditConfig(result, res);
      } else {
        _redirect('/', res);
      }
    }
  } catch (error) {
    writeLog(null, 500, error, '_2');
  }
};

module.exports = {
  _getConfig
};