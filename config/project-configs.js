'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const path = require('path');
const homeDir = require('os').homedir();
const authUserName = 'Admin';
const authAppName = 'NDA';
const authSecret = 'adm1nNd@Usr';
const authQrCodeFile = 'nda_auth_otp';

module.exports = {
  NDA_BASE_PATH: path.resolve(homeDir, '.nda'),
  PROJECTS_CONFIG_PATH: path.resolve(homeDir, '.nda/config/projects.json'),
  CHILD_PROCESS_BASE_CONFIG_PATH: path.resolve(homeDir, '.nda/config'),
  CHILD_PROCESS_LOG_PATH: path.resolve(homeDir, '.nda/logs'),
  AUTH_QR_CODE_IMG_PATH: path.resolve(homeDir, '.nda/config/'),
  authAppName, authUserName, authSecret, authQrCodeFile
};