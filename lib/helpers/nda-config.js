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

const addSSLErrObject = (obj) => {
  obj.sslCertErr = '';
  obj.sslKeyErr = '';
  return obj;
};

const sslConfigFields = ['sslKey', 'sslCert', 'sslEnabled'];

const mapSSLConfig = (configObj) => {
  let status = true;
  let mapSSLErr = null;
  try {
    fs.writeFileSync(sslConfigFilePath, JSON.stringify(getAllowedFields(configObj, sslConfigFields)));
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
  if (!fs.existsSync(sslConfigFilePath)) {
    return null;
  }
  let sslConfig = {};
  try {
    sslConfig = JSON.parse(fs.readFileSync(sslConfigFilePath));
  } catch (err) {
    //Do nothing.
  }
  return sslConfig;
};

const removeSSLConfig = () => {
  let status = true;
  let deleteSSLErr = null;
  if (fs.existsSync(sslConfigFilePath)) {
    try {
      fs.unlinkSync(sslConfigFilePath);
    } catch (err) {
      status = false;
    }
  }

  if (!status) {
    deleteSSLErr = os.type().indexOf('Windows') > -1 ? errorMessages.SSL_UNMAP_ERR_WINDOWS : errorMessages.SSL_UNMAP_ERR_LINUX;
    writeLog(null, 500, deleteSSLErr, '_2');
  }

  return { status, err: deleteSSLErr };
};

module.exports = {
  addSSLErrObject, mapSSLConfig, getSSLConfig, removeSSLConfig
};