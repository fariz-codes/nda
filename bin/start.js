#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const projectConfig = require('../config/project-configs');
const utils = require('../lib/helpers/utilities');
const CONFIG_PATH = projectConfig.CHILD_PROCESS_BASE_CONFIG_PATH;
const { _restartRunningPids } = require('../lib/models/process');

const port = process.env.port;
const appURL = `http://localhost:${port}`;
const startScriptPath = path.resolve(CONFIG_PATH, 'start-script.vbs');
const vbsPath = path.resolve(CONFIG_PATH, 'executer.vbs');

const sendCLIResponse = () => {
  fs.writeFileSync(vbsPath, `CreateObject("WScript.Shell").Run "${appURL}"`);
  console.log(`Open ${appURL} in your browser to explore nda.`);
  exec(vbsPath, {});
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
      fs.writeFileSync(startScriptPath, `CreateObject("Wscript.Shell").Run "node ${path.resolve(__dirname, 'server.js')}", 0`);

      exec(startScriptPath, {}, function (err) {
        if (!err) {
          let startInterval = setInterval(function () {
            utils.isPortInUse(port, (data) => {
              if (data && data.inUse) {
                clearInterval(startInterval);
                let runningPids = fs.existsSync(path.resolve(CONFIG_PATH, 'runningPids.txt')) ? fs.readFileSync(path.resolve(CONFIG_PATH, 'runningPids.txt')).toString() : null;
                runningPids = runningPids ? runningPids.split(',') : [];
                if (runningPids && runningPids.length > 0) {
                  _restartRunningPids(runningPids, () => {
                    sendCLIResponse();
                  });
                } else {
                  sendCLIResponse();
                }
              }
            });
          }, 2000);
        } else {
          let error = utils.convertBufferToArray(err);
          console.log(`Failed to start Deployment Assistant due to the following error:\n ${error}`);
        }
      });
    }
  }
});