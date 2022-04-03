'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const path = require('path');
const nBootStart = require('n-bootstart');
const nBootScripts = new nBootStart();
const { _redirectToEditConfig, _redirect } = require('../models/redirector');
const { writeLog } = require('../helpers/log-writer');
let processPort = process.env.PORT || process.env.port;
processPort = processPort ? processPort.toString().trim() : '';
const projectName = require('../../package.json').name + '_' + processPort;

const _getConfig = (req, res) => {
  try {
    let view = req.query.view ? true : false;
    let projectConfig = nBootScripts._view(projectName);
    if (view) {
      _redirectToEditConfig(projectConfig, res);
    } else {
      let result;
      if (req.query && req.query.startonbootchk === 'on') {
        let projectPath = path.resolve(__dirname, '../../bin/server.js');
        if (!projectConfig || projectPath !== projectConfig.path) {
          result = nBootScripts._enable(projectName, projectPath, `PORT=${processPort}`);
        }
      } else if (projectConfig && projectConfig.status) {
        result = nBootScripts._disable(projectName);
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