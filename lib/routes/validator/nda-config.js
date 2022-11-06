'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const fs = require('fs');
const path = require('path');
const { _redirectToEditConfig } = require('../../models/redirector');

const sslIntegration = (req, res, next) => {
  if (req.query && req.query.bindssl === 'on') {
    let compileParams = { sslKeyErr: '', sslCertErr: '', sslKey: req.query['ssl-key-text'], sslCert: req.query['ssl-cert-text'] };
    compileParams.status = req.query.startonbootchk === 'on' ? true : false;
    compileParams.envVars = req.query.openinbrowser === 'on' ? 'openInBrowser=true' : '';
    if (req.query['ssl-key-text'] && req.query['ssl-cert-text']) {
      let sslKeyExists = fs.existsSync(path.resolve(req.query['ssl-key-text']));
      let sslCertExists = fs.existsSync(path.resolve(req.query['ssl-cert-text']));
      if (!sslKeyExists || !sslCertExists) {
        compileParams.sslKeyErr = !sslKeyExists ? 'Unable to locate the key file. Please check the path and extension' : '';
        compileParams.sslCertErr = !sslCertExists ? 'Unable to locate the crt file. Please check the path and extension' : '';
        return _redirectToEditConfig(compileParams, res);
      }
    } else {
      compileParams.sslParamsErr = 'ssl-key-text and ssl-cert-text are required';
      return _redirectToEditConfig(compileParams, res);
    }
  }

  return next();
};

module.exports = {
  sslIntegration
};