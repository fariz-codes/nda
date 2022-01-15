const express = require('express');
const path = require('path');
const http = require('http');
const { _redirect } = require('../lib/models/redirector');
const { writeLog } = require('../lib/helpers/log-writer');
const fs = require('fs');
const projectConfig = require('../config/project-configs');
const CONFIG_PATH = projectConfig.CHILD_PROCESS_BASE_CONFIG_PATH;

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

let server = http.createServer(app);

// Start the application
server.listen(port, () => {
  process.setMaxListeners(0);
  if (!process.env.PORT) {
    process.env.PORT = port;
  }
  fs.writeFileSync(path.resolve(CONFIG_PATH, 'pid.txt'), process.pid)
  fs.writeFileSync(path.resolve(CONFIG_PATH, 'port.txt'), port)
});

module.exports = { app };