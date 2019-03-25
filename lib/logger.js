const chalk = require('chalk');

/**
* Simple logging library
*/
class Logger {
  /**
  * Logs a message to the console
  * @param {string} type The type of log. Accepts: debug, warn, error, success, info.
  * @param {*} args Arguments to log
  */
  log(type, ...args) {
    if(type === 'debug' && !process.env.DEBUG) {
      return;
    }
    const type = colourise(type.toLowerCase(), type);
    const timestamp = colourise((new Date()).toISOString(), 'debug');
    console.log(`${timestamp} ${type}`, ...args);
  }
  /**
   * Adds colour to emphasise a string in a log
   * @param {string} str String to emphasise
   * @return {string} Emphasised string
   */
  emph(str) {
    return colourise(str,'emphasis');
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
