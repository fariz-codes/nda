'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const { stopAllProjects, _projects } = require('../models/process');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const projectConfig = require('../../config/project-configs');
const utils = require('../helpers/utilities');
const CONFIG_PATH = projectConfig.CHILD_PROCESS_BASE_CONFIG_PATH;
const vbsPath = path.resolve(CONFIG_PATH, 'executer.vbs');

async function stopNDA(isLinux) {
  await stopAllProjects();
  let pidPath = path.resolve(CONFIG_PATH, 'pid.txt');
  let portPath = path.resolve(CONFIG_PATH, 'port.txt');
  let pid = fs.existsSync(pidPath) ? fs.readFileSync(pidPath) : null;
  if (pid && pidPath) {
    if (isLinux) {
      exec(`kill -9 ${pid.toString().trim()}`, {});
    } else {
      fs.writeFileSync(vbsPath, `CreateObject("WScript.Shell").Run "taskkill /F /PID ${pid.toString().trim()}", 0`);
      exec(vbsPath, {});
    }
    fs.unlinkSync(pidPath);
    fs.unlinkSync(portPath);
    console.log('nda is stopped now.');
  } else {
    console.log('nda is not running.');
  }
}

async function handleCommands(isLinux) {
  switch (true) {
    case process.argv.slice(2)[0].toString().trim() === 'run':
      let port = process.argv.slice(3)[0];
      process.env.openInBrowser = 'true';
      process.env.port = port ? parseInt(port.toString().trim()) : 8055;
      console.log(`Starting NDA in port ${process.env.port}..\n`);
      if (isLinux) {
        require('../../bin/start-linux');
      } else {
        require('../../bin/start');
      }
      break;
    case process.argv.slice(2)[0].toString().trim() === 'sleep':
      await stopNDA(isLinux);
      break;
    case process.argv.slice(2)[0].toString().trim() === 'status':
      let pidPath = path.resolve(CONFIG_PATH, 'pid.txt');
      let previousPid = fs.existsSync(pidPath) ? fs.readFileSync(pidPath) : null;
      if (previousPid && utils.isPidRunning(previousPid)) {
        let portPath = path.resolve(CONFIG_PATH, 'port.txt');
        let previousPort = fs.existsSync(portPath) ? fs.readFileSync(portPath) : null;
        console.log(`nda is running on port - ${previousPort}. Open http://localhost:${previousPort} in your browser to explore nda.`);
      } else {
        console.log('nda is not running.');
      }
      break;
    case process.argv.slice(2)[0].toString().trim() === 'respawn':
      let pidIdPath = path.resolve(CONFIG_PATH, 'pid.txt');
      let previousPidId = fs.existsSync(pidIdPath) ? fs.readFileSync(pidIdPath) : null;
      if (previousPidId && utils.isPidRunning(previousPidId)) {
        let ndaPort = fs.readFileSync(path.resolve(CONFIG_PATH, 'port.txt'));
        let projects = await _projects();
        let runningProjects = [];
        for (let i = 0; i < projects.length; i++) {
          if (projects[i].pid && parseInt(projects[i].pid) > 0) {
            runningProjects.push(projects[i].UID);
          }
        }
        await stopNDA(isLinux);
        process.env.openInBrowser = 'true';
        process.env.port = ndaPort.toString().trim();
        fs.writeFileSync(path.resolve(CONFIG_PATH, 'runningPids.txt'), runningProjects.toString());
        console.log(runningProjects.length > 0 ? 'Restarting the nda & services started by it..' : 'Restarting the nda.');
        let startInterval = setInterval(function () {
          utils.isPortInUse(process.env.port, (data) => {
            if (data && !data.inUse) {
              clearInterval(startInterval);
              if (isLinux) {
                require('../../bin/start-linux');
              } else {
                require('../../bin/start');
              }
            }
          });
        }, 2000);
      } else {
        console.log('nda is not running. Respawn option will work only when nda is in running state');
      }
      break;
  };

}

if (process.argv.slice(2).length > 0) {
  if (os.type().indexOf('Windows') > -1) {
    handleCommands(false);
  } else if (os.type().indexOf('Windows') < 0) {
    handleCommands(true);
  }
}