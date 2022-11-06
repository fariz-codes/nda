'use strict';

/**
 * NDA is protected by DMCA (2022).
 * It's source code is licensed under GNU AGPL 3.0
 */

module.exports = {
  PROJECT: {
    INFO: {
      PROJECT_STOPPED: 'Project is stopped.',
      PACKAGE_INSTALLATION: '\nThis issue can be resolved in two ways.\n \n1. Update the project configuration in NDA portal with the `Install Packages` checkbox enabled and start the project again. \n2. Manually do the `npm install`'
    },
    Error: {
      ALREADY_EXISTS: 'A project already exists with same name',
      FIELDS_REQUIRED: 'name, port & project path are required fields',
      PACKAGE_REQUIRED: 'Cannot find module',
      INVALID_PROJECT_PATH: 'Unable to locate the project folder. Please check the project base path',
      INVALID_STARTFILE_PATH: 'Unable to locate the project start file. Please check the project start file path',
      START_TIMEOUT: 'This project is taking longer time to start. Please check the project code base for any issues or try starting it again',
      INVALID_JOB_PATH: 'Unable to locate path of one or more jobs. Please re-check the highlighted jobs path',
      JOB_FIELDS_REQUIRED: 'Job name & Job path are required to create a job',
      SSL_MAP_ERR_WINDOWS: 'Failed to update ssl config. Please re-run the nda application with administrator privileges',
      SSL_MAP_ERR_LINUX: 'Failed to update ssl config. Please re-run the nda application as a `sudo` user',
      SSL_FILES_ERR: 'There was a problem when trying to start with SSL. Please check the provided SSL files. \n\nStarting without the SSL..\n'
    },
    Success: {
      '#220': 'Project cloned successfully'
    },
    ErrorCodes: {
      '#0422': 'Failed to start the project. Please check the project logs',
      '#0423': 'Failed to stop / re-start the project. Please check the project logs',
      '#0400': 'No logs found for this project.',
      '#0409': 'Port is already in use. Please configure your project with a different port & try again',
      '#0410': 'Dependency packages are required to start this project. Please check the project logs',
      '#0411': 'Failed to start the project. Please re-check your project base path or start file',
      '#0412': 'Failed to start the project. Please configure this project with a port to start it'
    }
  },
  AUTHENTICATION: {
    Error: {
      accessDenied: 'access is denied',
      authNotEnabled: 'Unable to find the auth info. Please check the cli commands to enable the authentication',
      invalidInfo: 'Invalid username or password'
    }
  }
};