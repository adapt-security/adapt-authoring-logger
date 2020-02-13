const { AbstractModule } = require('adapt-authoring-core');
const chalk = require('chalk');
/**
* Module for logging message to the console
* @extends {AbstractModule}
*/
class LoggerModule extends AbstractModule {
  /** @override */
  constructor(app, pkg) {
    super(app, pkg);
    this.app.logger = this;
    this.initialise();
  }
  /**
  * Initialises the utility
  * @return {Promise}
  */
  async initialise() {
    const config = await this.app.waitForModule('config');
    const enabledLevels = config.get('adapt-authoring-logger.enabledLevels');
    const isLevelEnabled = level => enabledLevels.includes(level);
    /**
    * Module configuration options
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
  /** @override */
  setReady() {
    /** @ignore */ this._isReady = true;
    this.emit('ready', this);
    this.constructor.emit('ready', this.name, this);
    this.log('debug', 'logger', 'ready');
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
    const timestamp = this.config.timestamp ? `${this.colourise(new Date().toISOString(), 'grey')} ` : '';
    console.log(`${timestamp}${this.colourise(level, config.colour)} ${this.colourise(id, 'magenta')}`, ...args);
  }
  /** @ignore */
  colourise(str, colour) {
    const chalkFunc = chalk[colour];
    return chalkFunc ? chalkFunc(str) : str;
  }
}

module.exports = LoggerModule;
