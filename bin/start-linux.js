#!/usr/bin/env node

const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');
const projectConfig = require('../config/project-configs');
const utils = require('../lib/helpers/utilities');
const CONFIG_PATH = projectConfig.CHILD_PROCESS_BASE_CONFIG_PATH;

const port = process.env.port;
const appURL = `http://localhost:${port}`;

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
      let serverPath = path.resolve(__dirname, 'server.js');
      const ls = spawn(`node`, [serverPath], { detached: true, env: { PORT: port } });

      let startInterval = setInterval(function () {
        utils.isPortInUse(port, function (data) {
          if (data && data.inUse) {
            clearInterval(startInterval);
            console.log(`Open ${appURL} in your browser to explore nda.`);
            let openCmd = 'open';
            if (os.type().indexOf('Linux') > -1) {
              openCmd = 'xdg-open';
            }
            spawn(openCmd, [appURL], {});
          } else {
            console.log(`Failed to start Deployment Assistant. Please try again.`);
          }
        });
      }, 2000);
    }
  }
});