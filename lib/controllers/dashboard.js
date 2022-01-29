'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const fs = require('fs');
const path = require('path');
const { writeLog } = require('../helpers/log-writer');
const { _projects } = require('../models/process');
const { _redirectToDashboard } = require('../models/redirector');
const { PROJECT } = require('../helpers/constant-texts');
const projectConfig = require('../../config/project-configs');
const CONFIG_PATH = projectConfig.CHILD_PROCESS_BASE_CONFIG_PATH;

const _load = async (req, res) => {
  try {
    let projects = await _projects();
    let runningProjects = 0;
    if (projects && projects.length > 0) {
      for (let i = 0; i < projects.length; i++) {
        if (projects[i].pid && parseInt(projects[i].pid) > 0) {
          runningProjects++;
        }
      }
    }
    _redirectToDashboard({ process: projects, runningProjects }, res);
  } catch (error) {
    writeLog(null, 500, error, '_2');
  }
};

const _errorCodes = (req, res) => {
  res.send(PROJECT.ErrorCodes);
};

const _update = async (req, res) => {
  try {
    let projects = await _projects();
    let runningPids = fs.existsSync(path.resolve(CONFIG_PATH, 'runningPids.txt')) ? fs.readFileSync(path.resolve(CONFIG_PATH, 'runningPids.txt')).toString() : null;
    runningPids = runningPids ? runningPids.split(',') : [];
    let runningProjects = 0;
    if (projects && projects.length > 0) {
      for (let i = 0; i < projects.length; i++) {
        if (projects[i].pid && parseInt(projects[i].pid) > 0) {
          runningProjects++;
        }
        if (runningPids.length > 0 && runningPids.indexOf(projects[i].UID) > -1) {
          projects[i].ignoreCrash = true;
        }
      }
    }

    res.json({ projects, runningProjects });
  } catch (error) {
    writeLog(null, 500, error, '_2');
  }
};

module.exports = {
  _load, _errorCodes, _update
};