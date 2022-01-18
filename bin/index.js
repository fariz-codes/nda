#!/usr/bin/env node

const commands = ['run', 'sleep', 'status', 'refresh'];
const optionsLength = {
  run: 4,
  sleep: 3,
  status: 3,
  refresh: 3
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
      return false;
  }
};

console.log('                 Node Deployment Assistant\n');
if (isValidCommand() && isValidOption()) {
  require('../lib/helpers/process-command');
} else {
  console.log('Usage: nda <command> [options]\n');
  console.log('nda run          starts nda in default port 8055\n');
  console.log('nda run port     starts nda in mentioned port\n');
  console.log('nda sleep        stops nda & all the services started by it\n');
  console.log('nda status       provides the current running status of nda\n');
  console.log('nda refresh      restarts the nda & all the services started by it.\n\n');
  console.log('Examples: \n');
  console.log('nda run 7000     starts nda in 7000 port');
}

