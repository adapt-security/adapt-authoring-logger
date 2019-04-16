const chalk = require('chalk');
const { Singleton, Utils } = require('adapt-authoring-core');

/**
* Simple logging library
*/
class Logger {
  /**
  * @typedef {Object} LOG_LEVEL
  * @property {string} Debug
  * @property {string} Warn
  * @property {string} Error
  * @property {string} Success
  * @property {string} Info
  */
  static get LOG_LEVEL() {
    return {
      debug: 'debug',
      warn: 'warn',
      error: 'error',
      success: 'success',
      info: 'info'
    };
  }
  /**
  * Logs a message to the console
  * @param {LOG_LEVEL} level The type of log. Accepts: debug, warn, error, success, info.
  * @param {String} id Identifier for the
  * @param {...Object} args Arguments to log
  */
  log(level, id, ...args) {
    level = level.toLowerCase();
    if(!Logger.LOG_LEVEL[level]) { // check level exists
      this.log(Logger.LOG_LEVEL.warn, );
      level = Logger.LOG_LEVEL.info;
    }
    if(level === Logger.LOG_LEVEL.debug && !process.env.DEBUG) {
        return;
    }
    console.log(
      `${colourise((new Date()).toISOString(), 'grey')}`,
      `${colourise(level, level)}`,
      `${colourise(id, 'magenta')}`,
      ...args
    );
  }
  /**
  * Applies a colour to a string using chalk.js
  * @param {String} str String to colour
  * @param {String} type Level/colour to apply
  */
  colourise(str, type) {
    const chalkFunc = {
      debug: chalk.grey,
      warn: chalk.yellow,
      error: chalk.red,
      success: chalk.green,
      info: chalk.cyan
    }[type] || chalk[type];

    return chalkFunc ? chalkFunc(str) : str;
  }
}

module.exports = Utils.compose(Logger, Singleton);
