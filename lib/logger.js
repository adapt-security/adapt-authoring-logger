const chalk = require('chalk');

/**
* Simple logging library
*/
class Logger {
  /**
  * Logs a message to the console
  * @param {string} level The type of log. Accepts: debug, warn, error, success, info.
  * @param {*} args Arguments to log
  */
  log(level, id, ...args) {
    level = level.toLowerCase();

    if(level === 'debug' && !process.env.DEBUG) {
        return;
    }
    console.log(
      `${colourise((new Date()).toISOString(), 'debug')}`,
      `${colourise(level, level)}`,
      `${colourise(id, 'emphasis')}`,
      ...args
    );
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
