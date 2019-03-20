const chalk = require('chalk');

/**
* Simple logging library
*/
class Logger {
  /**
  * Logs a message to the console
  * @param {string} type The type of log. Accepts: warn, error, log.
  * @param {*} msg The message to log
  * @param {*} args Any other arguments
  */
  log(type, msg, ...args) {
    if(type === 'debug' && !process.env.DEBUG) {
      return;
    }
    var type = colourise(type.toUpperCase(), type);
    var timestamp = (new Date()).toISOString();
    console.log(`${type} [${timestamp}]: ${msg}`);
  }
}

const COLOUR_MAP = {
  debug: chalk.grey,
  warn: chalk.yellow,
  error: chalk.red,
  success: chalk.green,
  info: chalk.cyan,
  emphasis: chalk.magenta
};

function colourise(str, type) {
  const func = COLOUR_MAP[type];
  if(!func) return str;
  return func(str);
}

let instance;

module.exports = function getInstance() {
  if(!instance) instance = new Logger();
  return instance;
}();
