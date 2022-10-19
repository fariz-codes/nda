#!/usr/bin/env node

const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');
const projectConfig = require('../config/project-configs');
const utils = require('../lib/helpers/utilities');
const CONFIG_PATH = projectConfig.CHILD_PROCESS_BASE_CONFIG_PATH;
const { _restartRunningPids, _startProjectsOnBoot } = require('../lib/models/process');
const { PROJECT } = require('../lib/helpers/constant-texts');
const { getSSLConfig } = require('../lib/helpers/nda-config');
const port = process.env.PORT || 8055;

const sendCLIResponse = () => {
  const { protocol } = getSSLConfig();
  const appURL = `${protocol}://localhost:${port}`;
  console.log(`Open ${appURL} in an internet browser to explore NDA.`);
  if (process.env.openInBrowser === 'true') {
    let openCmd = 'open';
    if (os.type().indexOf('Linux') > -1) {
      openCmd = 'xdg-open';
    }
    spawn(openCmd, [appURL], {});
  }
};

utils.isPortInUse(port, (data) => {
  if (data && data.inUse) {
    console.log(`Failed to start NDA on port ${port}. An application is already running on it.`);
  } else {
    let pidPath = path.resolve(CONFIG_PATH, 'pid.txt');
    let previousPid = fs.existsSync(pidPath) ? fs.readFileSync(pidPath) : null;
    if (previousPid && utils.isPidRunning(previousPid)) {
      let portPath = path.resolve(CONFIG_PATH, 'port.txt');

      let previousPort = fs.existsSync(portPath) ? fs.readFileSync(portPath) : null;
      const { protocol } = getSSLConfig();
      console.log(`NDA is already running on port - ${previousPort}. Try opening ${protocol}://localhost:${previousPort} in an internet browser.`);
    } else {
      let serverPath = path.resolve(__dirname, 'server.js');
      const spawnResponse = spawn(process.execPath, [serverPath], { detached: true, env: { PORT: port } });

      spawnResponse.stdout.on('data', (data) => {
        let serverMsg = utils.convertBufferToArray(data);
        if (serverMsg && serverMsg.indexOf('SSL error') > -1) {
          console.log(PROJECT.Error.SSL_FILES_ERR);
        }
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
      });

      spawnResponse.on('error', (data) => {
        let errMsg = utils.convertBufferToArray(data);
        console.log(errMsg)
      });
    }
  }
});