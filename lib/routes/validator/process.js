'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const fs = require('fs');
const path = require('path');
const { PROJECT } = require('../../helpers/constant-texts');
const { _projectFields, _projects, _updateProjects, _projectJobs, _projectInfo } = require('../../models/process');
const { _redirectToAddProject, _redirect } = require('../../models/redirector');
const { isPidRunning, prepareJobFields } = require('../../helpers/utilities');

const _addProcess = async (req, res, next) => {
  let isError = false;
  let errMsg = '';
  let fieldId = '';
  let newFields = _projectFields(req.query);

  if (!newFields.name || !newFields.port || !newFields.projectpath || !newFields.startfilepath || newFields.name.length <= 0 || newFields.port.length <= 0 || newFields.projectpath.length <= 0 || newFields.startfilepath.length <= 0) {
    isError = true;
    errMsg = PROJECT.Error.FIELDS_REQUIRED;
  } else {
    let projects = await _projects();
    projects.forEach((project) => {
      if (project.name === newFields.name && (!newFields.UID || (newFields.UID && project.UID && newFields.UID !== project.UID))) {
        isError = true;
        fieldId = 'name';
        errMsg = PROJECT.Error.ALREADY_EXISTS;
      }
    });
    if (!isError && !fs.existsSync(path.resolve(newFields.projectpath))) {
      isError = true;
      fieldId = 'projectpath';
      errMsg = PROJECT.Error.INVALID_PROJECT_PATH;
    }
    if (!isError && !fs.existsSync(path.resolve(newFields.projectpath, newFields.startfilepath))) {
      isError = true;
      fieldId = 'startfilepath';
      errMsg = PROJECT.Error.INVALID_STARTFILE_PATH;
    }
  }

  if (isError) {
    let jobFields = _projectJobs(req.query);
    let { jobsList } = prepareJobFields(jobFields, req.query);
    req.query.jobs = jobsList;
    _redirectToAddProject({ errMsg, fieldId, fields: req.query }, res);
  } else {
    next();
  }
};

const _pidCheck = async (req, res, next) => {
  const { UID } = req.query;
  const { pid } = await _projectInfo(UID);
  if (isPidRunning(pid)) {
    req.query.pid = pid;
    next();
  } else {
    await _updateProjects({ pid: 'N/A' }, UID);
    _redirect('/?err_code=#0423', res);
  }
};

module.exports = {
  _addProcess, _pidCheck
};