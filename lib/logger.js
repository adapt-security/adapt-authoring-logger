const Module = require('adapt-authoring-core').DataTypes.Module;
const chalk = require('chalk');

class Logger extends Module {
  log(type, msg, ...args) {
    var type = colourise(type.toUpperCase(), type);
    var timestamp = (new Date()).toISOString();
    console.log(`${type} [${timestamp}]: ${msg}`);
  }
}

const COLOUR_MAP = {
  warn: chalk.yellow,
  error: chalk.red
};

function colourise(str, type) {
  const func = COLOUR_MAP[type];
  if(!func) return str;
  return func(str);
}

module.exports = Logger;
