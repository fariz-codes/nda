'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const inquirer = require('inquirer');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { stopAllProjects, _projects } = require('../models/process');
const { exec } = require('child_process');
const projectConfig = require('../../config/project-configs');
const utils = require('../helpers/utilities');
const CONFIG_PATH = projectConfig.CHILD_PROCESS_BASE_CONFIG_PATH;
const vbsPath = path.resolve(CONFIG_PATH, 'executer.vbs');
const { getSSLConfig } = require('../helpers/nda-config');
const { validateCredentials, getAuthInfo, saveAuthInfo } = require('../helpers/authenticator');

const enableAuth = (username, password, isReplaced) => {
  let authResult = saveAuthInfo(username, password);
  if (authResult && authResult.status) {
    let successMsg = isReplaced ? '\nSuccessfully updated authentication info.!' : 'Successfully enabled authentication.!';
    console.log(successMsg);
  } else {
    console.log(authResult.err);
  }
};

const handleReAuth = async (username, password) => {
  const prompt = inquirer.createPromptModule();
  const { confirmation } = await prompt([{
    name: "confirmation",
    type: "input",
    message: "Do you wish to replace the existing credentials with the currently provided one. y to proceed / n to abort ?"
  }]);
  const confirmInput = confirmation.toString().trim().toLowerCase();

  if (confirmInput !== 'y' && confirmInput !== 'n') {
    console.log('\n Invalid option. Try again');
    return;
  }

  if (confirmInput === 'y') {
    enableAuth(username, password, true);
  } else {
    console.log('\nOperation aborted');
  }
};

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
    console.log('NDA is stopped now.\n');
  } else {
    console.log('NDA is not running.');
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
        const { protocol } = getSSLConfig();
        console.log(`NDA is running on port - ${previousPort}. Open ${protocol}://localhost:${previousPort} in an internet browser.`);
      } else {
        console.log('NDA is not running.');
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
        console.log(`Starting NDA in port ${process.env.port}..\n`);
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
        console.log('NDA is not running. Respawn option will work only when it is in running state');
      }
      break;
    case process.argv.slice(2)[0].toString().trim() === 'enable-auth':
      if (utils.isAdminUser()) {
        let username = process.argv.slice(3)[0];
        let password = process.argv.slice(3)[1];
        let validation = validateCredentials(username, password);
        if (validation.status) {
          let authentication = getAuthInfo();
          if (authentication.status) {
            handleReAuth(username, password);
          } else {
            enableAuth(username, password);
          }
        } else {
          console.log(validation.errMsg);
        }
      } else {
        const adminAccessErr = isLinux ? 'as a sudo user' : 'as an administrator';
        console.log(`Please run this command ${adminAccessErr}`);
      }
      break;
  };

}

if (process.argv.slice(2).length > 0) {
  handleCommands(os.type().indexOf('Windows') > -1 ? false : true);
}