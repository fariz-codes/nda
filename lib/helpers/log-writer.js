'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const fs = require('fs');
const path = require('path');
const lineReader = require('line-reader');
const projectConfig = require('../../config/project-configs');
const { currentDateTime } = require('./utilities');
const CHILD_PROCESS_LOG_PATH = projectConfig.CHILD_PROCESS_LOG_PATH;

const LOG_TYPES = {
  '_0': 'INFO:',
  '_1': 'WARNING:',
  '_2': 'ERROR:'
};

const storeToFile = (dateObj, msgContent, UID) => {
  let logFilePath = UID ? `${UID}_${dateObj}.txt` : `System_${dateObj}.txt`;
  let completeLogPath = path.resolve(CHILD_PROCESS_LOG_PATH, logFilePath);
  if (!fs.existsSync(completeLogPath)) {
    fs.writeFileSync(completeLogPath, '');
  }
  fs.appendFileSync(completeLogPath, '\n' + msgContent);
};

const writeLog = (response = null, statusCode = null, message, msgType = '_0', UID = null) => {
  message = message.toString();
  if (msgType === '_1') {
    message = message.replace(LOG_TYPES._1, '');
  }
  message = message.trim();

  let dateTime = currentDateTime();
  let msgContent = `${dateTime} ${LOG_TYPES[msgType]} ${message}`;

  storeToFile(dateTime.split(' ')[0], msgContent, UID);

  if (response) {
    return response.status(statusCode).json({ message });
  }
};

const getErrorType = (errMsg) => {
  let msgType = '_1';
  if (errMsg && errMsg.toString().indexOf('WARNING') < 0) {
    msgType = '_2';
  }

  return msgType;
};

const latestLogFile = (UID, recent) => {
  let logFiles = fs.readdirSync(path.resolve(CHILD_PROCESS_LOG_PATH));
  let logsByUID = [];

  if (recent) {
    let todayDate = currentDateTime().split(' ')[0];
    return `${UID}_${todayDate}.txt`;
  }

  if (logFiles && logFiles.length > 0) {
    for (let i = 0; i < logFiles.length; i++) {
      let fileName = logFiles[i];

      if (fileName.split('_')[0].toString().trim() === UID.toString().trim()) {
        let fileDate = fileName.split('_')[1].split('.')[0];
        logsByUID.push({ id: fileName, date: new Date(fileDate) });
      }
    }
  }

  if (logsByUID.length > 0) {
    logsByUID = logsByUID.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
  }

  return logsByUID[0] ? logsByUID[0].id : '';
};

const logContents = (filePath, index = 0, recent, limitInput, callback) => {
  let content = '', count = 0;
  let fileContent = fs.readFileSync(path.resolve(filePath)).toString().trim();
  let totalLines = fileContent.split('\n').length;

  if (recent) {
    index = totalLines > 10 ? totalLines - 10 : 0;
  }

  let defaultLimit = limitInput && parseInt(limitInput) > 100 ? parseInt(limitInput) : 100;
  let limit = index > 0 ? eval(parseInt(index) + defaultLimit) : defaultLimit;
  lineReader.eachLine(path.resolve(filePath), function (line, last, cb) {
    count++;
    if (count > index) {
      content += line;
      content += '\n';
    }

    if (last || count >= limit) {
      cb(false);
      callback({ content, count, totalLines });
    } else {
      cb();
    }
  });
};

const deleteProjectLogs = (UID) => {
  let logFiles = fs.readdirSync(path.resolve(CHILD_PROCESS_LOG_PATH));
  if (logFiles && logFiles.length > 0) {
    for (let i = 0; i < logFiles.length; i++) {
      let fileName = logFiles[i];

      if (fileName.split('_')[0].toString().trim() === UID.toString().trim()) {
        fs.unlinkSync(path.resolve(CHILD_PROCESS_LOG_PATH, fileName));
      }
    }
  }
};

module.exports = {
  writeLog, getErrorType, latestLogFile, logContents, deleteProjectLogs
};