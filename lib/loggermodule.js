const { AbstractModule } = require('adapt-authoring-core');
const chalk = require('chalk');
/**
* Utility to log message to the console
*/
class LoggerModule extends AbstractModule {
  /**
  * @param {App} app The app instance
  * @param {Object} config Specific config for this Logger
  */
  constructor(app, pkg) {
    super(app, pkg);
    this.initialise();
  }
  /**
  * Initialises the utility
  */
  async initialise() {
    const config = await this.app.waitFor('config');
    const enabledLevels = config.get('adapt-authoring-logger.enabledLevels');
    const isLevelEnabled = level => enabledLevels.includes(level);
    /**
    * @type {Object}
    */
    this.config = {
      levels: {
        error: {
          enable: isLevelEnabled('error'),
          colour: 'red'
        },
        warn: {
          enable: isLevelEnabled('warn'),
          colour: 'yellow'
        },
        success: {
          enable: isLevelEnabled('success'),
          colour: 'green'
        },
        info: {
          enable: isLevelEnabled('info'),
          colour: 'cyan'
        },
        debug: {
          enable: isLevelEnabled('debug'),
          colour: 'grey'
        }
      },
      timestamp: config.get('adapt-authoring-logger.showTimestamp')
    };
    this.setReady();
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
  /**
  * Logs a message to the console
  * @param {String} level Severity of the message
  * @param {String} id Identifier for the message. Helps to differentiate between other messages.
  * @param {...*} args Arguments to be logged
  */
  log(level, id, ...args) {
    const config = this.config.levels[level];
    if(!config.enable) {
      return;
    }
    const timestamp = this.config.timestamp ? `${this.colourise((new Date()).toISOString(), 'grey')} ` : '';
    console.log(`${timestamp}${this.colourise(level, config.colour)} ${this.colourise(id, 'magenta')}`, ...args);
  }
  /** @ignore */
  colourise(str, colour) {
    const chalkFunc = chalk[colour];
    return chalkFunc ? chalkFunc(str) : str;
  }
}

module.exports = LoggerModule;
