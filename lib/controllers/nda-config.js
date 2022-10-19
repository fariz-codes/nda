'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const os = require('os');
const path = require('path');
const nBootStart = require('n-bootstart');
const { _redirectToEditConfig, _redirect } = require('../models/redirector');
const { writeLog } = require('../helpers/log-writer');
let processPort = process.env.PORT || process.env.port;
processPort = processPort ? processPort.toString().trim() : '';
const projectName = require('../../package.json').name + '_' + processPort;
const { addSSLErrObject, mapSSLConfig, getSSLConfig, removeSSLConfig } = require('../helpers/nda-config');

const _getConfig = (req, res) => {
  try {
    const nBootScripts = new nBootStart();
    let view = req.query.view ? true : false;
    let projectConfig = nBootScripts._view(projectName);
    if (view) {
      let sslConfig = getSSLConfig();
      if (sslConfig && sslConfig.sslKey) {
        projectConfig.sslKey = sslConfig.sslKey;
        projectConfig.sslCert = sslConfig.sslCert;
      }
      _redirectToEditConfig(addSSLErrObject(projectConfig), res);
    } else {
      let result, envVarChanged;
      if (req.query && req.query.startonbootchk === 'on') {
        let openInBrowser = req.query.openinbrowser === 'on' ? 'true' : 'false';
        let startFile = os.type().indexOf('Windows') > -1 ? 'start' : 'start-linux';
        let projectPath = path.resolve(__dirname, `../../bin/${startFile}.js`);
        if (projectConfig && projectConfig.envVars && projectConfig.envVars.indexOf(`openInBrowser=${openInBrowser}`) < 0) {
          nBootScripts._disable(projectName);
          envVarChanged = true;
        }
        if (!projectConfig || projectPath !== projectConfig.path || envVarChanged) {
          result = nBootScripts._enable(projectName, projectPath, `PORT=${processPort},openInBrowser=${openInBrowser}`);
        }
      } else if (projectConfig && projectConfig.status) {
        result = nBootScripts._disable(projectName);
      }

      if (req.query && req.query.bindssl === 'on') {
        let mapSSL = mapSSLConfig({ sslKey: path.resolve(req.query['ssl-key-text']), sslCert: path.resolve(req.query['ssl-cert-text']) });
        if (mapSSL && mapSSL.mapSSLErr) {
          if (!result) {
            result = {};
          }
          result.mapSSLErr = mapSSL.err;
        }
      } else {
        let unMapSSL = removeSSLConfig();
        if (unMapSSL && unMapSSL.err) {
          if (!result) {
            result = {};
          }
          result.unMapSSLErr = unMapSSL.err;
        }
      }

      if (result && ((result.err && result.err.indexOf('script already exists') < 0) || result.mapSSLErr || result.unMapSSLErr)) {
        _redirectToEditConfig(addSSLErrObject(result), res);
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