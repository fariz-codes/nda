'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const os = require('os');
const fs = require('fs');
const path = require('path');
const detect = require('detect-port');
const { PROJECT, AUTHENTICATION } = require('../helpers/constant-texts');
const { execSync } = require('child_process');
const isLinux = os.type().indexOf('Windows') > -1 ? false : true;

const isAdminUser = () => {
  let isAdmin = true;
  let adminCmd = isLinux ? 'sudo -v' : 'net session';
  try {
    let execResponse = execSync(adminCmd);
    execResponse = execResponse ? convertBufferToArray(execResponse) : '';
    if (execResponse && execResponse.toString().trim().toLowerCase().indexOf(AUTHENTICATION.Error.accessDenied) > -1) {
      isAdmin = false;
    }
  } catch (err) {
    isAdmin = false;
  }

  return isAdmin;
};

const convertBufferToArray = (buffer) => {
  let lines = buffer.toString().split('\n');
  let msgContent = '';
  lines.forEach((line) => {
    let parts = line.split('=');
    parts.forEach((items) => {
      msgContent += items + '\n';
    })
  });

  return msgContent;
};

const twoDigitNumber = (numericVal) => {
  return parseInt(numericVal) < 10 ? '0' + parseInt(numericVal) : numericVal;
};

const currentDateTime = (date = null) => {
  let dateString = date ? new Date(date) : new Date();
  let month = dateString.getMonth() + 1;
  month = twoDigitNumber(month);
  return `${dateString.getFullYear()}-${month}-${twoDigitNumber(dateString.getDate())} ${twoDigitNumber(dateString.getHours())}:${twoDigitNumber(dateString.getMinutes())}:${twoDigitNumber(dateString.getSeconds())}`;
};

const isPortInUse = async (portNumber, callback) => {
  detect(portNumber, (err, _port) => {
    if (err) {
      callback({ inUse: false, ignore: true });
    }

    if (!err && portNumber == _port) {
      callback({ inUse: false });
    } else {
      callback({ inUse: true });
    }
  });
}

const isPidRunning = (pid) => {
  try {
    pid = parseInt(pid.toString().trim());
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

const prepareJobFields = (jobFields, query) => {
  let jobsList = [];
  let jobIndex = 1;
  let errMsg = '';
  let fieldId;

  for (const key in jobFields) {
    if (key && key.length > 0 && !jobFields[key]['job-status-' + key]) {
      jobFields[key]['job-status-' + key] = false;
    }
    let jobObjects = jobFields[key];

    if (parseInt(key) !== jobIndex) {
      jobObjects['job-name-' + jobIndex] = jobObjects['job-name-' + key];
      jobObjects['job-path-' + jobIndex] = jobObjects['job-path-' + key];
      jobObjects['job-status-' + jobIndex] = jobObjects['job-status-' + key];
    }

    if (!jobObjects['job-name-' + key] || !jobObjects['job-path-' + key]) {
      errMsg = PROJECT.Error.JOB_FIELDS_REQUIRED;
      fieldId = jobObjects['job-name-' + key] ? 'job-path-' + jobIndex : 'job-name-' + jobIndex;
    }

    jobsList.push(jobObjects);

    if (errMsg === '' && !fs.existsSync(path.resolve(query.projectpath, jobObjects['job-path-' + jobIndex]))) {
      errMsg = PROJECT.Error.INVALID_JOB_PATH;
      fieldId = 'job-path-' + jobIndex;
    }

    jobIndex++;
  }

  return { errMsg, fieldId, jobsList };
};

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const getAllowedFields = (obj, fields) => {
  let mappedObj = {};

  for (const key in obj) {
    if (fields.indexOf(key) > -1) {
      mappedObj[key] = obj[key];
    }
  }

  return mappedObj;
};

module.exports = {
  convertBufferToArray, currentDateTime, isPortInUse, isPidRunning, prepareJobFields,
  formatBytes, getAllowedFields, isAdminUser
};