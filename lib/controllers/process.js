'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const fs = require('fs');
const { _redirect, _redirectToAddProject } = require('../models/redirector');
const { _projectFields, _startProject, _hashFromName, _projects, _updateProjects, _stopProject, _deleteProject, stopAllProjects, _projectJobs } = require('../models/process');
const { currentDateTime, isPidRunning, prepareJobFields } = require('../helpers/utilities');
const { writeLog } = require('../helpers/log-writer');
const projectConfig = require('../../config/project-configs');
const NDA_BASE_PATH = projectConfig.NDA_BASE_PATH;
const PROJECTS_CONFIG_PATH = projectConfig.PROJECTS_CONFIG_PATH;
const CHILD_PROCESS_BASE_CONFIG_PATH = projectConfig.CHILD_PROCESS_BASE_CONFIG_PATH;
const CHILD_PROCESS_LOG_PATH = projectConfig.CHILD_PROCESS_LOG_PATH;

const _setProjectConfig = async () => {
  if (!fs.existsSync(NDA_BASE_PATH)) {
    fs.mkdirSync(NDA_BASE_PATH);
  }
  if (!fs.existsSync(CHILD_PROCESS_BASE_CONFIG_PATH)) {
    fs.mkdirSync(CHILD_PROCESS_BASE_CONFIG_PATH);
  }
  if (!fs.existsSync(CHILD_PROCESS_LOG_PATH)) {
    fs.mkdirSync(CHILD_PROCESS_LOG_PATH);
  }
  if (!fs.existsSync(PROJECTS_CONFIG_PATH)) {
    fs.writeFileSync(PROJECTS_CONFIG_PATH, JSON.stringify([]))
  }

  await _updateProjects({ pid: 'N/A', cpu: 'N/A' });
};

_setProjectConfig();

const _addForm = async (req, res) => {
  try {
    let compilationParams = { errMsg: '' };
    if (req.query.edit === 'true' && req.query.UID) {
      let projects = await _projects();
      for (let i = 0; i < projects.length; i++) {
        if (projects[i].UID.toString() === req.query.UID.toString()) {
          compilationParams.fields = projects[i];
        }
      }
    }

    _redirectToAddProject(compilationParams, res);
  } catch (error) {
    writeLog(null, 500, error, '_2');
  }
};

const _store = async (req, res) => {
  try {
    let projects = await _projects();
    let newFields = _projectFields(req.query);
    newFields.envvariables = JSON.parse(JSON.stringify(newFields.envvariables));
    if (!newFields.pkginstallopt) {
      newFields.pkginstallopt = false;
    } else {
      newFields.pkginstallopt = true;
    }
    if (!newFields.bootstartopt) {
      newFields.bootstartopt = false;
    } else {
      newFields.bootstartopt = true;
    }

    let jobFields = _projectJobs(req.query);
    let { jobsList, errMsg, fieldId } = prepareJobFields(jobFields, newFields);
    newFields.jobs = jobsList;

    if (errMsg === '') {
      if (newFields.UID) {
        if (newFields.createdAt) delete newFields.createdAt;
        newFields.updatedAt = currentDateTime();
        await _updateProjects(newFields, newFields.UID);
      } else {
        newFields.UID = _hashFromName(newFields.name);
        projects.push(newFields);
        fs.writeFileSync(PROJECTS_CONFIG_PATH, JSON.stringify(projects));
      }

      _redirect('/', res);
    } else {
      _redirectToAddProject({ errMsg, fieldId, fields: newFields }, res);
    }
  } catch (error) {
    writeLog(null, 500, error, '_2');
  }
};

const _start = async (req, res) => {
  try {
    _startProject(req.query.UID, async (err, response) => {
      let redirectionPath = req.query.redirectionpath ? req.query.redirectionpath : '/';
      if (err && err.code) {
        redirectionPath = '/?err_code=' + err.code;
      }

      if (response && response.pid) {
        if (isPidRunning(response.pid)) {
          let projects = await _projects();
          projects.forEach((obj) => {
            if (obj.UID === req.query.UID) {
              obj.pid = response.pid;
            }
          });

          fs.writeFileSync(PROJECTS_CONFIG_PATH, JSON.stringify(projects));
        } else {
          redirectionPath = '/?err_code=#0422';
        }
      }

      _redirect(redirectionPath, res);
    });

  } catch (error) {
    writeLog(null, 500, error, '_2');
  }
};

const _stop = async (req, res) => {
  try {
    let redirectionPath = '/';
    let response = await _stopProject(req.query.pid);
    if (response && response.err) {
      redirectionPath += '?err_code=' + response.err.code;
    }

    _redirect(redirectionPath, res);
  } catch (error) {
    writeLog(null, 500, error, '_2');
  }
};

const _delete = async (req, res) => {
  try {
    let redirectionPath = '/';
    let response = await _deleteProject(req.query.UID);
    if (response && response.err) {
      redirectionPath += '?err_code=' + response.err.code;
    }

    _redirect(redirectionPath, res);
  } catch (error) {
    writeLog(null, 500, error, '_2');
  }
};

const _restart = async (req, res) => {
  try {
    let response = await _stopProject(req.query.pid);
    if (response && response.err) {
      let redirectionPath = req.query.redirectionpath ? req.query.redirectionpath : '/';
      _redirect(redirectionPath + '?err_code=' + response.err.code, res);
    } else {
      let pidCheckInterval = setInterval(() => {
        if (!isPidRunning(req.query.pid)) {
          clearInterval(pidCheckInterval);
          _start(req, res);
        }
      }, 1000);
    }
  } catch (error) {
    writeLog(null, 500, error, '_2');
  }
};

const _stopAll = async (req, res) => {
  try {
    await stopAllProjects();

    _redirect('/', res);
  } catch (error) {
    writeLog(null, 500, error, '_2');
  }
};

module.exports = {
  _addForm, _store, _start, _stop, _delete, _restart, _stopAll
};