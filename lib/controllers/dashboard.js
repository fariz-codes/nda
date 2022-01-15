'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const { writeLog } = require('../helpers/log-writer');
const { _projects } = require('../models/process');
const { _redirectToDashboard } = require('../models/redirector');
const { PROJECT } = require('../helpers/constant-texts');

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
    let runningProjects = 0;
    if (projects && projects.length > 0) {
      for (let i = 0; i < projects.length; i++) {
        if (projects[i].pid && parseInt(projects[i].pid) > 0) {
          runningProjects++;
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