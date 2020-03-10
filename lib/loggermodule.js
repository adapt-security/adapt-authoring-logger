const { AbstractModule } = require('adapt-authoring-core');
const chalk = require('chalk');
/**
* Module for logging message to the console
* @extends {AbstractModule}
*/
class LoggerModule extends AbstractModule {
  /** @ignore */ static colourise(str, colour) {
    const chalkFunc = chalk[colour];
    return chalkFunc ? chalkFunc(str) : str;
  }
  /** @ignore */ static isLevelEnabled(enabledLevels, level) {
    return enabledLevels.includes(level);
  }
  /** @ignore */ static getModuleOverrides(enabledLevels, level) {
    const levels = [];
    enabledLevels.forEach(l => l.indexOf(`${level}.`) === 0 && levels.push(l));
    return levels;
  }
  /** @ignore */ static formatDate(config) {
    let str;
    if(config.dateFormat === 'short') {
      const d = new Date();
      const m = d.getMonth()+1;
      const s = d.getSeconds();
      const date = `${d.getDate()}/${m < 10 ? `0${m}` : m}/${d.getFullYear().toString().slice(2)}`;
      const time = `${d.getHours()}:${d.getMinutes()}:${s < 10 ? `0${s}` : s}`;
      str = `${date}-${time}`;
    }
    if(config.dateFormat === 'iso') {
      str = new Date().toISOString();
    }
    return LoggerModule.colourise(str, 'grey');
  }
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
    /**
    * Module configuration options
    * @type {Object}
    */
    this.config = {
      levels: {
        error: {
          enable: LoggerModule.isLevelEnabled(enabledLevels, 'error'),
          moduleOverrides: LoggerModule.getModuleOverrides(enabledLevels, 'error'),
          colour: 'red'
        },
        warn: {
          enable: LoggerModule.isLevelEnabled(enabledLevels, 'warn'),
          moduleOverrides: LoggerModule.getModuleOverrides(enabledLevels, 'warn'),
          colour: 'yellow'
        },
        success: {
          enable: LoggerModule.isLevelEnabled(enabledLevels, 'success'),
          moduleOverrides: LoggerModule.getModuleOverrides(enabledLevels, 'success'),
          colour: 'green'
        },
        info: {
          enable: LoggerModule.isLevelEnabled(enabledLevels, 'info'),
          moduleOverrides: LoggerModule.getModuleOverrides(enabledLevels, 'info'),
          colour: 'cyan'
        },
        debug: {
          enable: LoggerModule.isLevelEnabled(enabledLevels, 'debug'),
          moduleOverrides: LoggerModule.getModuleOverrides(enabledLevels, 'debug'),
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
    if(!config.enable && !config.moduleOverrides.includes(`${level}.${id}`)) {
      return;
    }
    const timestamp = this.config.timestamp ? `${LoggerModule.dateStamp(this.config)} ` : '';
    console.log(`${timestamp}${LoggerModule.colourise(level, config.colour)} ${LoggerModule.colourise(id, 'magenta')}`, ...args);
  }
}

module.exports = LoggerModule;
