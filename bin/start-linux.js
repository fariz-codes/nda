#!/usr/bin/env node

const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');
const projectConfig = require('../config/project-configs');
const utils = require('../lib/helpers/utilities');
const CONFIG_PATH = projectConfig.CHILD_PROCESS_BASE_CONFIG_PATH;
const { _restartRunningPids, _startProjectsOnBoot } = require('../lib/models/process');

const port = process.env.port;
const appURL = `http://localhost:${port}`;

const sendCLIResponse = () => {
  console.log(`Open ${appURL} in your browser to explore nda.`);
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
    console.log(`Failed to start nda on port ${port}. An application is already running on that port.`);
  } else {
    let pidPath = path.resolve(CONFIG_PATH, 'pid.txt');
    let previousPid = fs.existsSync(pidPath) ? fs.readFileSync(pidPath) : null;
    if (previousPid && utils.isPidRunning(previousPid)) {
      let portPath = path.resolve(CONFIG_PATH, 'port.txt');
      let previousPort = fs.existsSync(portPath) ? fs.readFileSync(portPath) : null;
      console.log(`nda is already running on port - ${previousPort}. Open http://localhost:${previousPort} in your browser to explore nda.`);
    } else {
      let serverPath = path.resolve(__dirname, 'server.js');
      const spawnResponse = spawn(process.execPath, [serverPath], { detached: true, env: { PORT: port } });
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

      spawnResponse.on('error', (data) => {
        console.log(`Failed to start nda on port ${port}. Please ensure the port that you are trying is not in use & run again.`);
      });
    }
  }
});