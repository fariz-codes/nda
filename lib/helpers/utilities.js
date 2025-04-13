'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const crypto = require('crypto');
const base32 = require('hi-base32');
const fs = require('fs');
const path = require('path');
const detect = require('detect-port');
const qrcode = require("qrcode");
const speakeasy = require("speakeasy");
const os = require('os');
const { execSync } = require('child_process');
const archiver = require('archiver');
const { PROJECT } = require('../helpers/constant-texts');
const { authAppName, authUserName, CHILD_PROCESS_BASE_CONFIG_PATH, authQrCodeFile } = require('../../config/project-configs');

archiver.registerFormat('zip-encryptable', require('archiver-zip-encryptable'));

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

const isRootUnix = () => {
  return process.getuid && process.getuid() === 0;
}

const isAdminWindows = () => {
  try {
    execSync('net session', { stdio: 'ignore' });
    return true;
  } catch (err) {
    return false;
  }
}

const isAdmin = () => {
  const platform = os.platform();
  if (platform === 'win32') {
    return isAdminWindows();
  } else {
    return isRootUnix();
  }
}

const generateSecret = (password) => {
  const hmac = crypto.createHmac('sha256', 'otpauthgen');
  hmac.update(password);
  const digest = hmac.digest();
  return base32.encode(digest).replace(/=+$/, '');
};

const generateQRCode = (password) => {
  const secret = generateSecret(password);
  const otpauthURL = speakeasy.otpauthURL({
    secret,
    label: authUserName,
    issuer: authAppName,
    encoding: 'base32'
  });
  const qrCodeImgFilePath = path.join(CHILD_PROCESS_BASE_CONFIG_PATH, authQrCodeFile + '.png');
  const qrCodeZipFilePath = path.join(CHILD_PROCESS_BASE_CONFIG_PATH, authQrCodeFile + '.zip');

  qrcode.toFile(qrCodeImgFilePath, otpauthURL, async (err) => {
    if (err) console.log("Failed to generate QR code");

    const output = fs.createWriteStream(qrCodeZipFilePath);
    const archive = archiver('zip-encryptable', {
      zlib: { level: 9 },
      encryptionMethod: 'aes256',
      password: password,
    });
    let username = os.userInfo().username;
    output.on('close', () => {
      fs.unlinkSync(qrCodeImgFilePath);
      if (os.platform() == 'win32') execSync(`icacls "${qrCodeZipFilePath}" /inheritance:r /remove:g *S-1-1-0 /grant:r ${username}:(F)`, { stdio: 'inherit' });
      if (os.platform() != 'win32') {
        execSync(`sudo chown ${username}:${username} "${qrCodeZipFilePath}"`, { stdio: 'inherit' });
        execSync(`chmod 700 "${qrCodeZipFilePath}"`, { stdio: 'inherit' });
      }
      console.log("\nQR code image is saved as '" + qrCodeZipFilePath + "'\nPlease extract it using the provided password and configure it in your authenticator app.");
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(output);
    archive.append(fs.readFileSync(qrCodeImgFilePath), { name: `${authQrCodeFile}.png` });
    await archive.finalize();
  });
};

const verifyOtp = (password, otp) => {
  let secret = generateSecret(password);
  
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token: otp,
    window: 1
  });
};

const getAuthSetupStatus = () => {
  let qrCodeFilePath = path.join(CHILD_PROCESS_BASE_CONFIG_PATH, authQrCodeFile + '.zip');
  let authQRCode = fs.existsSync(qrCodeFilePath);
  return { status: authQRCode ? true : false, path: qrCodeFilePath };
};

module.exports = {
  convertBufferToArray, currentDateTime, isPortInUse, isPidRunning, prepareJobFields,
  formatBytes, getAllowedFields, generateQRCode, isAdmin, verifyOtp, getAuthSetupStatus
};