#!/usr/bin/env node

const packageJson = require('./package.json');
const commands = ['run', 'sleep', 'status', 'respawn', 'setup-auth', 'info-auth'];
const optionsLength = {
  run: 4,
  sleep: 3,
  status: 3,
  respawn: 3,
  'setup-auth': 4,
  'info-auth': 3
};
const optionType = {
  run: 'number'
};

const getArg = (index) => {
  return process.argv[index] ? process.argv.slice(index)[0].toString().trim() : '';
};

const isValidCommand = () => {
  let command = getArg(2);
  return commands.indexOf(command) > -1 && process.argv.length <= optionsLength[command];
};

const isValidOption = () => {
  let command = getArg(2);
  let option = getArg(3);
  let type = optionType[command];

  if (!option) {
    return true;
  }

  switch (type) {
    case 'number':
      if (Number.isInteger(parseInt(option))) {
        return true;
      }
      return false;
    default:
      return true;
  }
};

console.log('                          ---------------------------------- ');
console.log(`                         | Node Deployment Assistant v${packageJson.version} |`);
console.log('                          ---------------------------------- ');
if (isValidCommand() && isValidOption()) {
  require('./lib/helpers/process-command');
} else {
  console.log('Usage: nda <command> [option]\n');
  console.log('------\n');
  console.log('nda setup-auth [password]       generates qr code image that can be used in the authenticator app. Please remember the password as it has to be provided during the login process.\n')
  console.log('                                **IMPORTANT**: To reset the password, please re-run the `setup-auth` and configure the newly generated qr code in your authenticator app\n')
  console.log('nda info-auth                   displays the file path of qr code to be configured in the authenticator app.\n')
  console.log('nda run                         starts nda in default port 8055\n');
  console.log('nda run [port]                  starts nda in mentioned port\n');
  console.log('nda sleep                       stops nda & all the services started by it\n');
  console.log('nda status                      provides the current running status of nda\n');
  console.log('nda respawn                     restarts the nda & all the services started by it. If nda is already running in your machine, then this command must be used after installing a new version of nda to apply the changes in it.\n\n');
  console.log('Examples: \n');
  console.log('---------\n');
  console.log('nda run 7000                    starts nda in 7000 port\n');
  console.log('nda setup-auth sUper@dm1n       generates qr code image using the provided password\n');
}

