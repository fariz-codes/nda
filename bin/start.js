#!/usr/bin/env node

const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const projectConfig = require('../config/project-configs');
const utils = require('../lib/helpers/utilities');
const CONFIG_PATH = projectConfig.CHILD_PROCESS_BASE_CONFIG_PATH;
const { _restartRunningPids, _startProjectsOnBoot } = require('../lib/models/process');
const { PROJECT } = require('../lib/helpers/constant-texts');

const port = process.env.PORT || 8055;
const appURL = `http://localhost:${port}`;
const vbsPath = path.resolve(CONFIG_PATH, 'executer.vbs');

const sendCLIResponse = () => {
  console.log(`Open ${appURL} in your browser to explore nda.`);
  if (process.env.openInBrowser === 'true') {
    fs.writeFileSync(vbsPath, `CreateObject("WScript.Shell").Run "${appURL}"`);
    exec(vbsPath, {});
  }
};

const initAppStart = () => {
  let startInterval = setInterval(function () {
    utils.isPortInUse(port, (data) => {
      if (data && (data.inUse || data.ignore)) {
        clearInterval(startInterval);
        let runningPids = fs.existsSync(path.resolve(CONFIG_PATH, 'runningPids.txt')) ? fs.readFileSync(path.resolve(CONFIG_PATH, 'runningPids.txt')).toString() : null;
        runningPids = runningPids ? runningPids.split(',') : [];
        if (runningPids && runningPids.length > 0) {
          _restartRunningPids(runningPids, () => {
            sendCLIResponse();
          });
        } else {
          _startProjectsOnBoot(() => {
            sendCLIResponse();
          });
        }
      }
    });
  }, 2000);
};

utils.isPortInUse(port, async function (data) {
  if (data && data.inUse) {
    console.log(`Failed to start nda on port ${port}. An application is already running on that port.`);
  } else {
    let pidPath = path.resolve(CONFIG_PATH, 'pid.txt');
    let previousPid = fs.existsSync(pidPath) ? fs.readFileSync(pidPath) : null;
    if (previousPid && utils.isPidRunning(previousPid)) {
      let portPath = path.resolve(CONFIG_PATH, 'port.txt');
      let previousPort = fs.existsSync(portPath) ? fs.readFileSync(portPath) : null;
      console.log(`nda is already running on port - ${previousPort}. Open http://localhost:${previousPort} in your browser to explore nda.`);
    } else {
      let spawnProcess = spawn(process.execPath, [path.resolve(__dirname, 'server.js')], { detached: true });

      spawnProcess.stdout.on('data', (data) => {
        let serverMsg = utils.convertBufferToArray(data);
        if (serverMsg && serverMsg.indexOf('SSL error') > -1) {
          console.log(PROJECT.Error.SSL_FILES_ERR);
        }
        initAppStart();
      });

      spawnProcess.stderr.on('data', (data) => {
        let errMsg = utils.convertBufferToArray(data);
        console.log(errMsg)
      });
    }
  }
});