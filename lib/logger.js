const chalk = require('chalk');
/**
* Utility to log message to the console
*/
class Logger {
  /**
  * @param {App} app The app instance
  * @param {Object} config Specific config for this Logger
  */
  constructor(app, config = {}) {
    const timestamp = config.timestamp !== undefined;
    const levels = config.levels || [];
    /**
    * @type {Object}
    */
    this.config = {
      levels: {
        debug: {
          enable: levels.includes('debug') || true,
          colour: 'grey'
        },
        info: {
          enable: levels.includes('info') || true,
          colour: 'cyan'
        },
        success: {
          enable: levels.includes('success') || true,
          colour: 'green'
        },
        warn: {
          enable: levels.includes('warn') || true,
          colour: 'yellow'
        },
        error: {
          enable: levels.includes('error') || true,
          colour: 'red'
         }
      },
      timestamp: timestamp || true
    };
  }
  /**
  * Logs a debug message to the console
  * @param {String} id Identifier for the
  * @param {...Object} args Arguments to log
  */
  debug(id, ...args) {
    this.log('debug', id, ...args);
  }
  /**
  * Logs an info message to the console
  * @param {String} id Identifier for the message
  * @param {...Object} args Arguments to log
  */
  info(id, ...args) {
    this.log('info', id, ...args);
  }
  /**
  * Logs a success message to the console
  * @param {String} id Identifier for the message
  * @param {...Object} args Arguments to log
  */
  success(id, ...args) {
    this.log('success', id, ...args);
  }
  /**
  * Logs a warning message to the console
  * @param {String} id Identifier for the message
  * @param {...Object} args Arguments to log
  */
  warn(id, ...args) {
    this.log('warn', id, ...args);
  }
  /**
  * Logs an error message to the console
  * @param {String} id Identifier for the message
  * @param {...Object} args Arguments to log
  */
  error(id, ...args) {
    this.log('error', id, ...args);
  }
  /** @ignore */
  log(level, id, ...args) {
    const config = this.config.levels[level];
    if(!config || !config.enable) {
      return;
    }
    console.log(
      this.config.timestamp ? `${this.colourise((new Date()).toISOString(), 'grey')}` : '',
      this.colourise(level, config.colour),
      this.colourise(id, 'magenta'),
      ...args
    );
  }
  /** @ignore */
  colourise(str, colour) {
    const chalkFunc = chalk[colour];
    return chalkFunc ? chalkFunc(str) : str;
  }
}

module.exports = Logger;
