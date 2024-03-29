const path = require('path');
const fs = require('fs');
const os = require('os');
const projectConfig = require('../../config/project-configs');
const CONFIG_PATH = projectConfig.CHILD_PROCESS_BASE_CONFIG_PATH;
const sslConfigPath = 'ssl_config.json';
const sslConfigFilePath = path.resolve(CONFIG_PATH, sslConfigPath);
const { writeLog } = require('../helpers/log-writer');
const errorMessages = require('../helpers/constant-texts').PROJECT.Error;
const { getAllowedFields } = require('../helpers/utilities');

const createSSLConfig = () => {
  if (!fs.existsSync(sslConfigFilePath)) {
    fs.writeFileSync(sslConfigFilePath, JSON.stringify({ sslEnabled: false }));
  }
};

createSSLConfig();

const addSSLFields = (obj) => {
  let sslFields = getSSLConfig();
  for (const key in sslFields) {
    obj[key] = sslFields[key];
  }
  obj.sslCertErr = '';
  obj.sslKeyErr = '';
  return obj;
};

const sslConfigFields = ['sslKey', 'sslCert', 'sslEnabled'];

const mapSSLConfig = (configObj) => {
  let status = true;
  let mapSSLErr = null;
  try {
    let existingFields = getSSLConfig();
    for (const key in configObj) {
      existingFields[key] = configObj[key];
    }
    fs.writeFileSync(sslConfigFilePath, JSON.stringify(getAllowedFields(existingFields, sslConfigFields)));
  } catch (err) {
    status = false;
  }
  if (!status) {
    mapSSLErr = os.type().indexOf('Windows') > -1 ? errorMessages.SSL_MAP_ERR_WINDOWS : errorMessages.SSL_MAP_ERR_LINUX;
    writeLog(null, 500, mapSSLErr, '_2');
  }
  return { status, err: mapSSLErr };
};

const getSSLConfig = () => {
  let sslConfig = {};
  try {
    sslConfig = JSON.parse(fs.readFileSync(sslConfigFilePath));
    sslConfig.protocol = sslConfig && sslConfig.sslEnabled ? 'https' : 'http';
  } catch (err) {
    //Do nothing.
  }
  return sslConfig;
};

const removeSSLConfig = () => {
  let { status, err } = mapSSLConfig({ sslKey: '', sslCert: '' });

  return { status, err };
};

module.exports = {
  addSSLFields, mapSSLConfig, getSSLConfig, removeSSLConfig
};