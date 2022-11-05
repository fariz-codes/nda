#!/usr/bin/env node

const os = require('os');
const isLinux = os.type().indexOf('Windows') > -1 ? false : true;
const packageJson = require('./package.json');
const commands = ['run', 'sleep', 'status', 'respawn', 'enable-auth'];
const optionsLength = {
  run: 4,
  sleep: 3,
  status: 3,
  respawn: 3,
  'enable-auth': 5
};
const optionType = {
  run: 'number'
};
const adminAccessMsg = isLinux ? 'as a sudo user' : 'with admin privilege';

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
  console.log(`nda enable-auth [username] [pwd] enables authentication. should be ran from a terminal ${adminAccessMsg}\n`);
  console.log('nda run                          starts nda in default port 8055\n');
  console.log('nda run [port]                   starts nda in mentioned port\n');
  console.log('nda sleep                        stops nda & all the services started by it\n');
  console.log('nda status                       provides the current running status of nda\n');
  console.log('nda respawn                      restarts the nda & all the services started by it. If nda is already running in your machine, then this command must be used after installing a new version of nda to apply the changes in it.\n\n');
  console.log('Examples: \n');
  console.log('nda enable-auth walter w@1Ter    enables authentication using the provided credentials\n');
  console.log('nda run 7000                     starts nda in 7000 port\n');
}

