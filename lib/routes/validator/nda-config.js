const fs = require('fs');
const path = require('path');
const { _redirectToEditConfig } = require('../../models/redirector');

const sslIntegration = (req, res, next) => {
  if (req.query && req.query.bindssl === 'on') {
    let sslKeyErr = '';
    let sslCertErr = '';
    if (req.query['ssl-key-text'] && req.query['ssl-cert-text']) {
      let sslKeyExists = fs.existsSync(path.resolve(req.query['ssl-key-text']));
      let sslCertExists = fs.existsSync(path.resolve(req.query['ssl-cert-text']));
      if (!sslKeyExists || !sslCertExists) {
        sslKeyErr = !sslKeyExists ? 'Unable to locate the key file. Please check the path and extension' : '';
        sslCertErr = !sslCertExists ? 'Unable to locate the crt file. Please check the path and extension' : '';
        return _redirectToEditConfig({ sslKeyErr, sslCertErr, sslKey: req.query['ssl-key-text'], sslCert: req.query['ssl-cert-text'] }, res);
      }
    } else {
      return _redirectToEditConfig({ sslKeyErr, sslCertErr, err: 'ssl-key-text and ssl-cert-text are required' }, res);
    }
  }

  return next();
};

module.exports = {
  sslIntegration
};