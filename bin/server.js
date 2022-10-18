'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const express = require('express');
const path = require('path');
const http = require('http');
const https = require('https');
const { writeLog } = require('../lib/helpers/log-writer');
const fs = require('fs');
const projectConfig = require('../config/project-configs');
const CONFIG_PATH = projectConfig.CHILD_PROCESS_BASE_CONFIG_PATH;
const { getSSLConfig } = require('../lib/helpers/nda-config');
const sslConfig = getSSLConfig();
let server;
let sslErr;

const app = express();

// Setup express server port from ENV, default: 8055
const port = process.env.PORT || 8055;
// For parsing json
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({
  extended: true,
  limit: '20mb'
}));

//Set to static path to serve static file
app.use(express.static(path.join(__dirname, "../lib/images")));

// Expose all the routes
app.use('/', function (req, res, next) {
  process.on('unhandledRejection', (reason, error) => {
    const responseHeaders = res.getHeaders();
    if ((reason || error) && !responseHeaders['etag']) {
      writeLog(null, 500, reason ? reason : error, '_2');
    }
  });

  process.on('uncaughtException', (reason, error) => {
    const responseHeaders = res.getHeaders();
    if ((reason || error) && !responseHeaders['etag']) {
      writeLog(null, 500, reason ? reason : error, '_2');
    }
  });

  next();

}, require('../lib/routes/index'));

if (sslConfig && sslConfig.sslKey && sslConfig.sslCert) {
  let sslKeyPath = path.resolve(sslConfig.sslKey);
  let sslCertPath = path.resolve(sslConfig.sslCert)
  let sslKeyExists = fs.existsSync(sslKeyPath);
  let sslCertExists = fs.existsSync(sslCertPath);
  if (sslKeyExists && sslCertExists) {
    try {
      server = https.createServer({
        key: fs.readFileSync(sslKeyPath),
        cert: fs.readFileSync(sslCertPath)
      }, app);
    } catch (err) {
      sslErr = err ? err.toString() : err;
    }
  }
} else {
  server = http.createServer(app);
}

// Start the application if no ssl error
if (sslErr) {
  writeLog(null, 500, sslErr, '_2');
  server = http.createServer(app);
}

try {
  server.listen(port, () => {
    process.setMaxListeners(0);
    if (!process.env.PORT) {
      process.env.PORT = port;
    }
    fs.writeFileSync(path.resolve(CONFIG_PATH, 'pid.txt'), process.pid.toString())
    fs.writeFileSync(path.resolve(CONFIG_PATH, 'port.txt'), port.toString())
    let startMsg = `NDA successfully started on port ${port}`;
    if (sslErr) startMsg += ' with SSL error';
    console.log(startMsg);
  });
} catch (err) {
  const errMsg = `Failed to start server on port ${port} due to error: \n${err ? err.toString() : err}`;
  writeLog(null, 500, errMsg, '_2');
  throw new Error(errMsg);
}
module.exports = { app };