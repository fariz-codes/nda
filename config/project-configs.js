const path = require('path');
const homeDir = require('os').homedir();

module.exports = {
  NDA_BASE_PATH: path.resolve(homeDir, '.nda'),
  PROJECTS_CONFIG_PATH: path.resolve(homeDir, '.nda/config/projects.json'),
  CHILD_PROCESS_BASE_CONFIG_PATH: path.resolve(homeDir, '.nda/config'),
  CHILD_PROCESS_LOG_PATH: path.resolve(homeDir, '.nda/logs')
};