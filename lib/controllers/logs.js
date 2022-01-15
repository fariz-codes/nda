'use strict';

const fs = require('fs');
const path = require('path');
const { _projectInfo } = require('../models/process');
const { _redirect, _redirectToLogs, _redirectToLogsList } = require('../models/redirector');
const { writeLog, latestLogFile, logContents } = require('../helpers/log-writer');
const { currentDateTime, formatBytes } = require('../helpers/utilities');
const projectConfig = require('../../config/project-configs');
const CHILD_PROCESS_LOG_PATH = projectConfig.CHILD_PROCESS_LOG_PATH;

const _logs = async (req, res) => {
  try {
    let { UID, id, filename, count, recent, limit } = req.query;
    let logFilePath = path.resolve(CHILD_PROCESS_LOG_PATH, id);
    if (UID && fs.existsSync(logFilePath)) {
      let disableLive = false;
      let { name } = await _projectInfo(UID);
      if (id) {
        let todayDate = currentDateTime().split(' ')[0];
        let logDate = id.split('_')[1].split('.')[0];
        if (logDate !== todayDate) {
          disableLive = true;
        }
      }
      logContents(logFilePath, count, recent, limit, (logs) => {
        _redirectToLogs({ projectName: name + ' - ' + filename, UID, id, content: logs.content, count: logs.count, disableLive, totalLines: logs.totalLines }, res);
      });
    } else {
      _redirect(`/logs/list?UID=${UID}&err_code=#0400`, res);
    }
  } catch (error) {
    writeLog(null, 500, error, '_2');
  }
};

const _logContent = async (req, res) => {
  try {
    const { UID, count, id, recent, limit } = req.query;
    const latestLogId = id ? id : latestLogFile(UID, recent);
    if (latestLogId && latestLogId !== '') {
      const logFilePath = path.resolve(CHILD_PROCESS_LOG_PATH, latestLogId);

      if (UID && fs.existsSync(logFilePath)) {
        logContents(logFilePath, count, recent, limit, (logs) => {
          res.json({ content: logs.content, count: logs.count, totalLines: logs.totalLines });
        });
      } else {
        res.json({ content: '' });
      }
    } else {
      res.json({ content: '' });
    }
  } catch (error) {
    writeLog(null, 500, error, '_2');
  }
};

const _list = async (req, res) => {
  try {
    let { UID } = req.query;
    let logFiles = fs.readdirSync(path.resolve(CHILD_PROCESS_LOG_PATH));
    let logsList = [];

    if (logFiles && logFiles.length > 0) {
      for (let i = 0; i < logFiles.length; i++) {
        let fileName = logFiles[i];
        let fileInfo = fs.statSync(path.resolve(CHILD_PROCESS_LOG_PATH, fileName));

        if (fileName.split('_')[0].toString().trim() === UID.toString().trim()) {
          let fileDate = fileName.split('_')[1];
          let modifiedAt = fileInfo && fileInfo.mtime ? currentDateTime(fileInfo.mtime) : 'N/A';
          let size = fileInfo && fileInfo.size ? formatBytes(fileInfo.size) : 'N/A';

          logsList.push({ id: fileName, UID, filename: fileDate.split('.')[0], size, modifiedAt });
        }
      }
    }

    if (logsList.length > 0) {
      logsList = logsList.sort((a, b) => {
        return new Date(b.modifiedAt) - new Date(a.modifiedAt);
      });
    }

    let { name } = await _projectInfo(UID);
    _redirectToLogsList({ projectName: name, UID, logsList }, res);
  } catch (error) {
    writeLog(null, 500, error, '_2');
  }
};

const _deleteLogFile = async (req, res) => {
  try {
    let { UID, id } = req.query;
    let logFilePath = path.resolve(CHILD_PROCESS_LOG_PATH, id);
    if (UID && fs.existsSync(logFilePath)) {
      fs.unlinkSync(logFilePath);
      _list(req, res);
    } else {
      _redirect(`/logs/list?UID=${UID}&err_code=#0400`, res);
    }
  } catch (error) {
    writeLog(null, 500, error, '_2');
  }
};

module.exports = {
  _logs, _logContent, _list, _deleteLogFile
};