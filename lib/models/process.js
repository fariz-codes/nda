'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const processKill = require('tree-kill');
const { spawn } = require('child_process');
const pidusage = require('pidusage');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { writeLog, getErrorType, deleteProjectLogs } = require('../helpers/log-writer');
const { PROJECT } = require('../helpers/constant-texts');
const { convertBufferToArray, isPortInUse, currentDateTime, isPidRunning } = require('../helpers/utilities');
const projectConfig = require('../../config/project-configs');
const PROJECTS_CONFIG_PATH = projectConfig.PROJECTS_CONFIG_PATH;
const CHILD_PROCESS_LOG_PATH = projectConfig.CHILD_PROCESS_LOG_PATH;
const CONFIG_PATH = projectConfig.CHILD_PROCESS_BASE_CONFIG_PATH;

let activeUID = {};

const _projects = async () => {
  let projects = fs.readFileSync(PROJECTS_CONFIG_PATH);
  try {
    projects = projects && projects.length > 0 && JSON.parse(projects) ? JSON.parse(projects) : [];
    let pids = [];
    projects.forEach((obj) => {
      if (obj.pid) {
        if (Number.isInteger(obj.pid) && isPidRunning(obj.pid)) {
          pids.push(obj.pid);
        } else {
          obj.pid = 'N/A';
        }
      }
    });
    projects.sort((a, b) => {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

    if (pids.length > 0) {
      let pidStats = await pidusage(pids);
      if (pidStats) {
        projects.forEach((obj) => {
          if (Number.isInteger(obj.pid) && pidStats[obj.pid.toString()]) {
            obj.cpu = parseFloat(pidStats[obj.pid.toString()].cpu).toFixed(2);
            if (obj.cpu > 100) {
              obj.cpu = 100.00;
            }
          }
        });
      }
    }

  } catch (err) {
    writeLog(null, 500, err, '_2')
  }

  return projects;
};

const _updateProjects = async (fields, UID = null) => {
  let projects = await _projects();
  projects.forEach((obj) => {
    if (UID && UID === obj.UID) {
      for (const key in fields) {
        obj[key] = fields[key];
      }
    } else if (!UID) {
      for (const key in fields) {
        obj[key] = fields[key];
      }
    }
  });

  fs.writeFileSync(PROJECTS_CONFIG_PATH, JSON.stringify(projects));
};

const _projectFieldByKey = async (key, value, fields) => {
  let projects = await _projects();
  let projectField = {};

  if (projects && projects.length > 0) {
    let project = projects.filter((obj) => {
      return obj[key].toString() === value.toString();
    });

    if (fields && fields.length > 0 && project && project[0]) {
      fields.forEach((key) => {
        if (project[0][key]) {
          projectField[key] = project[0][key];
        }
      });
    } else {
      projectField = project && project[0] ? project[0] : null;
    }
  }

  return projectField;
};

const _projectInfo = async (UID) => {
  let projects = await _projects();
  let projectInfo = {};

  if (projects && projects.length > 0) {
    let project = projects.filter((obj) => {
      return obj['UID'].toString() === UID.toString();
    });

    projectInfo = project && project[0] ? project[0] : null;
  }

  return projectInfo;
};

const _projectFields = (query) => {
  let { name, port, envvariables, projectpath, UID, startfilepath, pkginstallopt, jobs } = query;
  let jobsCount = jobs && Array.isArray(jobs) && jobs.length > 0 ? jobs.length : 'N/A';

  return { name, port, envvariables, projectpath, UID, startfilepath, pkginstallopt, jobsCount, cpu: 'N/A', pid: 'N/A', createdAt: currentDateTime(), updatedAt: currentDateTime() };
};

const _hashFromName = (input) => {
  let hash = 0, len = input.length;
  for (let i = 0; i < len; i++) {
    hash += input.charCodeAt(i);
  }
  return hash + '' + new Date().getUTCFullYear() + '' + new Date().getUTCDay() + '' + new Date().getUTCHours() + '' + new Date().getUTCMinutes();
}

const doPreChecks = (configParams, callback) => {
  if (!configParams.pkginstallopt || os.type().indexOf('Darwin') > -1) {
    isPortInUse(configParams.port, function (data) {
      if (data && data.inUse) {
        callback({ code: '#0409' });
      } else {
        callback(null);
      }
    });
  } else {
    writeLog(null, null, `Running npm install for "${configParams.name}".`, '_0', configParams.UID);

    let childProcess = spawn(os.type().indexOf('Windows') > -1 ? 'npm.cmd' : 'npm', ['install'], { cwd: path.resolve(configParams.projectpath) });

    childProcess.stdout.on('data', (data) => {
      writeLog(null, null, convertBufferToArray(data), '_0', configParams.UID);
    });

    childProcess.stderr.on('data', (data) => {
      let errMsg = convertBufferToArray(data);
      let msgType = getErrorType(errMsg);
      writeLog(null, null, errMsg, msgType, configParams.UID);
    });

    childProcess.on('exit', () => {
      isPortInUse(configParams.port, function (data) {
        if (data && data.inUse) {
          callback({ code: '#0409' });
        } else {
          callback(null);
        }
      });
    });
  }
};

const handleJobs = (projectpath, jobs, envvariables, UID) => {
  if (jobs && Array.isArray(jobs) && jobs.length > 0) {
    let availableJobs = 0;
    let jobPids = [];

    for (let i = 0; i < jobs.length; i++) {
      const jobKey = i + 1;
      if (jobs[i]['job-status-' + jobKey]) {
        availableJobs++;
        writeLog(null, null, `Starting the job - ${jobs[i]['job-name-' + jobKey]}.`, '_0', UID);

        jobs[i].pidSet = false;
        let jobsChild = spawn(process.execPath, [path.resolve(projectpath, jobs[i]['job-path-' + jobKey])], {
          env: envvariables, detached: true, cwd: projectpath
        });

        jobsChild.stdout.on('data', async (data) => {
          writeLog(null, null, convertBufferToArray(data), '_0', UID);
          if (!jobs[i].pidSet) {
            jobs[i].pidSet = true;
            jobPids.push({ name: jobs[i]['job-name-' + jobKey], pid: jobsChild.pid });
            if (jobPids.length === availableJobs) {
              await _updateProjects({ jobPids }, UID);
            }
          }
        });

        jobsChild.stderr.on('data', async (data) => {
          let errMsg = convertBufferToArray(data);
          let msgType = getErrorType(errMsg);

          writeLog(null, 500, errMsg, msgType, UID);

          if (!jobs[i].pidSet) {
            jobs[i].pidSet = true;
            jobPids.push({ name: jobs[i]['job-name-' + jobKey], pid: jobsChild.pid });
            if (jobPids.length === availableJobs) {
              await _updateProjects({ jobPids }, UID);
            }
          }
        });
      }
    }
  }
};

const _startProject = async (UID, callback) => {
  let { envvariables, port, projectpath, startfilepath, jobs, name, pkginstallopt } = await _projectInfo(UID);
  let callBackCount = 0;
  let callbackSent = 0;

  doPreChecks({ UID, port, projectpath, name, pkginstallopt }, (err) => {
    if (err) {
      callback(err);
    } else {
      if (projectpath && projectpath.length > 0 && startfilepath && startfilepath.length > 0) {
        let todayDate = currentDateTime().split(' ')[0];
        let logFilePath = path.resolve(CHILD_PROCESS_LOG_PATH, `${UID}_${todayDate}.txt`);
        if (!fs.existsSync(logFilePath)) {
          fs.writeFileSync(logFilePath, '');
        }
        try {
          envvariables = JSON.parse(envvariables);
        } catch (err) {
          envvariables = {};
        }

        for (const key in envvariables) {
          envvariables[key] = envvariables[key].toString().trim();
        }

        if (fs.existsSync(path.resolve(projectpath, 'config'))) {
          envvariables.NODE_CONFIG_DIR = path.resolve(projectpath, 'config');
        }

        if (port) {
          envvariables.port = port;
        }

        writeLog(null, null, `Starting the project - ${name}.`, '_0', UID);

        let child = spawn(process.execPath, [path.resolve(projectpath, startfilepath)], {
          env: envvariables, detached: true, cwd: projectpath
        });
        let err = null;
        let success = null;
        let callbackType = null;

        child.stdout.on('data', (data) => {
          writeLog(null, null, convertBufferToArray(data), '_0', UID);
          let successInterval = setInterval(async function () {
            isPortInUse(port, function (data) {
              if (data && (data.inUse || data.ignore)) {
                activeUID = {
                  [UID]: true
                };
                success = { status: 'OK', pid: child.pid };
              }
            });

            if (callbackSent === 0 && success) {
              callbackSent++;
              await _updateProjects({ lastRunAt: currentDateTime() }, UID);
              clearInterval(successInterval);
              callback(null, success);
              handleJobs(projectpath, jobs, envvariables, UID);
            } else if (callbackSent > 0) {
              clearInterval(successInterval);
              if (callbackType === 'error' && child.pid) {
                processKill(child.pid);
              }
            }
          }, 1000);
        });

        child.stderr.on('data', (data) => {
          let errMsg = convertBufferToArray(data);
          let msgType = getErrorType(errMsg);

          if (msgType === '_2') {
            err = { code: errMsg.indexOf(PROJECT.Error.PACKAGE_REQUIRED) > -1 ? '#0410' : '#0422' };
          }

          let callBackTimer = setInterval(async function () {
            if (success && callbackSent === 0) {
              clearTimeout(callBackTimer);
              callbackSent++;
              await _updateProjects({ lastRunAt: currentDateTime() }, UID);
              callback(null, success);
              callbackType = 'success';
              handleJobs(projectpath, jobs, envvariables, UID);
            } else if (callBackCount > 2 && callbackSent === 0 && err) {
              clearTimeout(callBackTimer);
              callbackSent++;
              callback(err);
              callbackType = 'error';
            } else if (callbackSent > 0) {
              clearTimeout(callBackTimer);
            } else {
              callBackCount++;
            }
          }, 2000);

          if (err && err.code === '#0410') {
            //errMsg += PROJECT.INFO.PACKAGE_INSTALLATION;
          }

          writeLog(null, 500, errMsg, msgType, UID);
        });
      } else if (callbackSent === 0) {
        callbackSent++;
        callback({ code: '#0422' });
      }
    }
  });
};

const _stopProject = async (pid) => {
  let { UID, jobPids } = await _projectFieldByKey('pid', parseInt(pid), ['UID', 'jobPids']);
  processKill(pid);
  if (activeUID[UID]) {
    delete activeUID[UID];
  }
  let updatedObjects = { pid: 'N/A', cpu: 'N/A' };
  if (jobPids && Array.isArray(jobPids) && jobPids.length > 0) {
    for (let i = 0; i < jobPids.length; i++) {
      if (jobPids[i].pid && parseInt(jobPids[i].pid) > 0) {
        processKill(jobPids[i].pid);
        writeLog(null, null, `Job - ${jobPids[i].name} is stopped.`, '_0', UID);
      }
    }
    updatedObjects['jobPids'] = [];
  }
  await _updateProjects(updatedObjects, UID);
  writeLog(null, null, PROJECT.INFO.PROJECT_STOPPED, '_0', UID);
  return { status: 'OK' };
};

const _deleteProject = async (UID) => {
  let projects = await _projects();
  let indexVal;
  projects.forEach((obj, index) => {
    if (obj.UID === UID) {
      indexVal = index;
    }
  });

  if (indexVal >= 0) {
    projects.splice(indexVal, 1);
  }
  fs.writeFileSync(PROJECTS_CONFIG_PATH, JSON.stringify(projects));
  deleteProjectLogs(UID);
  return { status: 'OK' };
};

const stopAllProjects = async () => {
  let projects = await _projects();
  if (projects && projects.length > 0) {
    for (let i = 0; i < projects.length; i++) {
      if (projects[i].pid && parseInt(projects[i].pid) > 0) {
        await _stopProject(projects[i].pid);
      }
    }
  }
};

const _projectJobs = (query) => {
  let jobKeys = {};
  for (const key in query) {
    if (key.toString().indexOf('job-name') > -1 || key.toString().indexOf('job-path') > -1 || key.toString().indexOf('job-status') > -1) {
      if (query[key] && query[key].length > 0) {
        let fieldIndex = key.split('-')[2];
        if (jobKeys[fieldIndex]) {
          jobKeys[fieldIndex][key] = key.toString().indexOf('job-status') > -1 ? true : query[key];
        } else {
          jobKeys[fieldIndex] = { [key]: query[key] };
        }
      }
    }
  }
  return jobKeys;
};

const _restartRunningPids = async (runningPids, callback) => {
  let startedPids = 0;
  let projects = await _projects();
  for (let i = 0; i < runningPids.length; i++) {
    _startProject(runningPids[i], async (err, response) => {
      startedPids++;
      if (response && response.pid) {
        if (isPidRunning(response.pid)) {
          projects.forEach((obj) => {
            if (obj.UID === runningPids[i]) {
              obj.pid = response.pid;
            }
          });
        }
      }

      if (startedPids === runningPids.length) {
        callback('Ok');
        fs.unlinkSync(path.resolve(CONFIG_PATH, 'runningPids.txt'));
        fs.writeFileSync(PROJECTS_CONFIG_PATH, JSON.stringify(projects));
      }
    });
  }
};

module.exports = {
  _projectFields, _startProject, _hashFromName, _projects,
  _updateProjects, _stopProject, _deleteProject, _projectInfo, stopAllProjects,
  _projectJobs, _restartRunningPids
};