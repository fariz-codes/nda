'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

const path = require('path');
const fs = require('fs');
const os = require('os');
const ejs = require('ejs');
const { getSSLConfig } = require('../helpers/nda-config');

const _redirect = (redirectionPath, res) => {
  const indexHTMLPath = path.join(__dirname, '../view', 'redirector.ejs');
  const htmlTemplate = fs.readFileSync(indexHTMLPath, 'utf8');
  const compiled = ejs.compile(htmlTemplate);
  let htmlContent = compiled({});
  res.set('Content-Type', 'text/html');
  htmlContent = htmlContent.replace('REDIRECT_URL', redirectionPath);
  res.send(Buffer.from(htmlContent));
};

const _redirectToAddProject = (compileParams = {}, res) => {
  const indexHTMLPath = path.join(__dirname, '../view', 'add-process.ejs');
  const htmlTemplate = fs.readFileSync(indexHTMLPath, 'utf8');
  const compiled = ejs.compile(htmlTemplate);

  if (!compileParams.fields) {
    compileParams.fields = {};
  }
  if (!(compileParams.fields.jobs && compileParams.fields.jobs.length > 0)) {
    compileParams.fields.jobs = [{
      'job-name-1': '', 'job-path-1': '', 'job-status-1': false
    }];
  }

  let htmlContent = compiled(compileParams);

  if (os.type().indexOf('Darwin') > -1) {
    htmlContent = htmlContent.replace('id="pkginstallopt"', 'id="pkginstallopt" style="display:none;" ');
    htmlContent = htmlContent.replace('for="pkginstallopt"', 'for="pkginstallopt" style="display:none;" ');
  }

  if (compileParams.fields.name) {
    htmlContent = htmlContent.replace('id="name"', 'id="name" value="' + compileParams.fields.name + '"');
    htmlContent = htmlContent.replace('id="port"', 'id="port" value="' + compileParams.fields.port + '"');

    for (let i = 0; i < compileParams.fields.jobs.length; i++) {
      let divCount = i + 1;
      let jobsField = compileParams.fields.jobs[i];
      if (jobsField['job-name-' + divCount]) {
        htmlContent = htmlContent.replace('id="job-name-' + divCount + '"', 'id="job-name-' + divCount + '" value="' + jobsField['job-name-' + divCount] + '"');
      }
      if (jobsField['job-path-' + divCount]) {
        htmlContent = htmlContent.replace('id="job-path-' + divCount + '"', 'id="job-path-' + divCount + '" value="' + jobsField['job-path-' + divCount] + '"');
      }
      if (jobsField['job-status-' + divCount]) {
        htmlContent = htmlContent.replace('id="job-status-' + divCount + '"', 'id="job-status-' + divCount + '" checked=true');
      }
    }

    htmlContent = htmlContent.replace('id="envvariables">', 'id="envvariables">' + compileParams.fields.envvariables);
    htmlContent = htmlContent.replace('id="projectpath"', 'id="projectpath" value="' + compileParams.fields.projectpath + '"');
    htmlContent = htmlContent.replace('id="startfilepath"', 'id="startfilepath" value="' + compileParams.fields.startfilepath + '"');
    if (compileParams.fields.pkginstallopt) htmlContent = htmlContent.replace('id="pkginstallopt"', 'id="pkginstallopt" checked=true');
    if (compileParams.fields.bootstartopt) htmlContent = htmlContent.replace('id="bootstartopt"', 'id="bootstartopt" checked=true');
    if (compileParams.fields.UID) {
      htmlContent = htmlContent.replace('id="UID"', 'id="UID" value="' + compileParams.fields.UID + '"');
      htmlContent = htmlContent.replace('<h2>Add Project</h2>', '<h2>Edit Project</h2>');
      htmlContent = htmlContent.replace('<title>Add', '<title>Edit');
    }
  }

  if (compileParams.fieldId) {
    htmlContent = htmlContent.replace(`id="${compileParams.fieldId}"`, `id="${compileParams.fieldId}" class="error-input"`);
  }

  res.set('Content-Type', 'text/html');
  res.send(Buffer.from(htmlContent));
};

const _redirectToDashboard = (compileParams = {}, res) => {
  const indexHTMLPath = path.join(__dirname, '../view', 'index.ejs');
  const htmlTemplate = fs.readFileSync(indexHTMLPath, 'utf8');
  const compiled = ejs.compile(htmlTemplate);
  const { protocol } = getSSLConfig();
  compileParams.PROTOCOL = protocol;
  let htmlContent = compiled(compileParams);
  htmlContent = htmlContent.split('${PORT}').join(process.env.PORT.trim());

  if (compileParams && compileParams.runningProjects && compileParams.runningProjects > 1) {
    htmlContent = htmlContent.replace('class="tooltip stop-all-project"', 'class="tooltip stop-all-project view-element"');
  }
  if (compileParams && compileParams.process && compileParams.process.length > 0) {
    for (let i = 0; i < compileParams.process.length; i++) {
      if (compileParams.process[i].pid && parseInt(compileParams.process[i].pid) > 0) {
        htmlContent = htmlContent.replace('"td-inactive-' + compileParams.process[i].UID + '"', '"td-inactive-' + compileParams.process[i].UID + '" class="hide-element"');
        htmlContent = htmlContent.replace('"td-active-' + compileParams.process[i].UID + '"', '"td-active-' + compileParams.process[i].UID + '" class="view-element"');
      } else {
        htmlContent = htmlContent.replace('"td-inactive-' + compileParams.process[i].UID + '"', '"td-inactive-' + compileParams.process[i].UID + '" class="view-element"');
        htmlContent = htmlContent.replace('"td-active-' + compileParams.process[i].UID + '"', '"td-active-' + compileParams.process[i].UID + '" class="hide-element"');
      }
    }
  }
  res.set('Content-Type', 'text/html');
  res.send(Buffer.from(htmlContent));
};

const _redirectToLogs = (compileParams = {}, res) => {
  const indexHTMLPath = path.join(__dirname, '../view', 'logs.ejs');
  const htmlTemplate = fs.readFileSync(indexHTMLPath, 'utf8');
  const compiled = ejs.compile(htmlTemplate);
  if (compileParams.content && compileParams.content.toString().length < 1) {
    compileParams.content = 'All logs of this project are cleared.';
  }
  const { protocol } = getSSLConfig();
  compileParams.PROTOCOL = protocol;
  let htmlContent = compiled(compileParams);
  htmlContent = htmlContent.split('${PORT}').join(process.env.PORT.trim());
  if (compileParams.totalLines) {
    htmlContent = htmlContent.replace('id="total-lines">', 'id="total-lines">' + compileParams.totalLines);
  }

  res.set('Content-Type', 'text/html');
  res.send(Buffer.from(htmlContent));
};

const _redirectToLogsList = (compileParams = {}, res) => {
  const indexHTMLPath = path.join(__dirname, '../view', 'logs-list.ejs');
  const htmlTemplate = fs.readFileSync(indexHTMLPath, 'utf8');
  const compiled = ejs.compile(htmlTemplate);
  const { protocol } = getSSLConfig();
  compileParams.PROTOCOL = protocol;
  let htmlContent = compiled(compileParams);
  htmlContent = htmlContent.split('${PORT}').join(process.env.PORT.trim());

  res.set('Content-Type', 'text/html');
  res.send(Buffer.from(htmlContent));
};

const _redirectToEditConfig = (compileParams = {}, res) => {
  const indexHTMLPath = path.join(__dirname, '../view', 'configuration.ejs');
  const htmlTemplate = fs.readFileSync(indexHTMLPath, 'utf8');
  const compiled = ejs.compile(htmlTemplate);
  if (!compileParams.err || compileParams.err.toString().indexOf('No content found') > -1 || compileParams.err.toString().indexOf('No script found') > -1) {
    compileParams.err = '';
  }
  if (compileParams.err.toString().indexOf('must be privileged') > -1) {
    compileParams.err = 'Please re-start the NDA as a `sudo` user to enable the start-on-boot';
  }

  let htmlContent = compiled(compileParams);
  htmlContent = htmlContent.split('${PORT}').join(process.env.PORT.trim());

  if (os.type().indexOf('Darwin') > -1) {
    htmlContent = htmlContent.replace('id="openinbrowser"', 'id="openinbrowser" style="display:none;" ');
    htmlContent = htmlContent.replace('for="openinbrowser"', 'for="openinbrowser" style="display:none;" ');
  }
  if (compileParams.err && compileParams.err.length > 0) {
    htmlContent = htmlContent.replace('id="startonbootchk"', 'id="startonbootchk" disabled="true"');
    if (os.type().indexOf('Darwin') < 0) htmlContent = htmlContent.replace('id="openinbrowser"', 'id="openinbrowser" disabled="true"');
    htmlContent = htmlContent.replace('class="start-on-boot-err"', 'class="start-on-boot-err" style="visibility: visible;"');
  } else if (compileParams.status) {
    htmlContent = htmlContent.replace('id="startonbootchk"', 'id="startonbootchk" checked=true');
    if (compileParams.envVars && compileParams.envVars.indexOf('openInBrowser=true') > -1) {
      htmlContent = htmlContent.replace('id="openinbrowser"', 'id="openinbrowser" checked=true');
    }
  } else {
    htmlContent = htmlContent.replace('id="openinbrowser"', 'id="openinbrowser" disabled=true');
  }
  if (compileParams.sslKeyErr !== '' || compileParams.sslCertErr !== '') {
    if (compileParams.sslCertErr) {
      htmlContent = htmlContent.replace('class="cert-file-err">', 'class="cert-file-err" style="visibility: visible;">' + compileParams.sslCertErr);
    }
    if (compileParams.sslKeyErr) {
      htmlContent = htmlContent.replace('class="key-file-err">', 'class="key-file-err" style="visibility: visible;">' + compileParams.sslKeyErr);
    }
  }
  if (compileParams.sslKey || compileParams.sslCert) {
    if (compileParams.sslKey) htmlContent = htmlContent.replace('id="ssl-key-text"', 'id="ssl-key-text" value=' + compileParams.sslKey);
    if (compileParams.sslCert) htmlContent = htmlContent.replace('id="ssl-cert-text"', 'id="ssl-cert-text" value=' + compileParams.sslCert);
    htmlContent = htmlContent.replace('id="bind-ssl-params"', 'id="bind-ssl-params" class=bind-ssl');
    htmlContent = htmlContent.replace('id="bindssl"', 'id="bindssl" checked=true');
  }
  res.set('Content-Type', 'text/html');
  res.send(Buffer.from(htmlContent));
};

module.exports = {
  _redirect,
  _redirectToAddProject, _redirectToDashboard, _redirectToLogs,
  _redirectToLogsList, _redirectToEditConfig
};