const chalk = require('chalk');
/**
* Utility to log message to the console
* @implements {AbstractLogger}
*/
class LoggerUtility {
  /**
  * @param {App} app The app instance
  * @param {Object} config Specific config for this Logger
  */
  constructor(app, pkg) {
    this.app = app;
    this.app.logger = this;
    this.pkg = pkg;

    this.initialise();
  }
  initialise() {
    const enabledLevels = this.app.config.get('adapt-authoring-logger.enabledLevels');
    /**
    * @type {Object}
    */
    this.config = {
      levels: {
        error: {
          enable: enabledLevels.includes('error'),
          colour: 'red'
        },
        warn: {
          enable: enabledLevels.includes('warn'),
          colour: 'yellow'
        },
        success: {
          enable: enabledLevels.includes('success'),
          colour: 'green'
        },
        info: {
          enable: enabledLevels.includes('info'),
          colour: 'cyan'
        },
        debug: {
          enable: enabledLevels.includes('debug'),
          colour: 'grey'
        }
      },
      timestamp: this.app.config.get('adapt-authoring-logger.showTimestamp')
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

  log(level, id, ...args) {
    const config = this.config && this.config.levels && this.config.levels[level];
    if(!config) {
      return console.log(level, id, ...args);
    }
    if(!config.enable) {
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

module.exports = LoggerUtility;
