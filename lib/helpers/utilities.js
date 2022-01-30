'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { PROJECT } = require('../helpers/constant-texts');

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

const cmdByVersion = {
  Windows: {
    cmd: 'netstat.exe',
    options: ['-na']
  },
  Linux: {
    cmd: 'netstat',
    options: ['-lptn']
  },
  Ubuntu: {
    cmd: 'ss',
    options: ['-lptn']
  },
  Mac: {
    cmd: 'ps',
    options: ['aux']
  }
};

const getPortCmdByOS = (osType) => {
  let osVersion = '';
  try {
    osVersion = os.version();
  } catch (err) {
    //Do nothing.
  }
  if (osType.indexOf('Windows') > -1) {
    return cmdByVersion['Windows'];
  } else if (osType.indexOf('Linux') > -1) {
    if (osVersion.indexOf('Ubuntu') > -1) {
      return cmdByVersion['Ubuntu'];
    } else {
      return cmdByVersion['Linux'];
    }
  } else if (osType.toString().toLowerCase().indexOf('macos') > -1) {
    return cmdByVersion['Mac'];
  }

  return null;
};

const isPortInUse = (portNumber, callback) => {
  const osType = os.type();
  let { cmd, options } = getPortCmdByOS(osType);
  if (cmd && options) {
    let pingCmd = spawn(cmd, options);
    let listeningPorts = '';
    pingCmd.stdout.on('data', (data) => {
      listeningPorts += convertBufferToArray(data);
    });

    pingCmd.stderr.on('data', (data) => {
      callback({ inUse: false });
    });

    pingCmd.on('exit', function () {
      if ((osType.indexOf('Windows') > -1 && listeningPorts && listeningPorts.indexOf(`0.0.0.0:${portNumber}`) > -1) || (osType.indexOf('Windows') < 0 && listeningPorts.indexOf(portNumber) > -1)) {
        callback({ inUse: true });
      } else {
        callback({ inUse: false });
      }
    });
  } else {
    callback({ inUse: false });
  }
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

module.exports = {
  convertBufferToArray, currentDateTime, isPortInUse, isPidRunning, prepareJobFields,
  formatBytes
};