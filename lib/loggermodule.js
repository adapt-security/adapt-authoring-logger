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
  /** @ignore */ static getDateStamp(config) {
    if(!config.timestamp) {
      return '';
    }
    let str;
    if(config.dateFormat === 'iso') {
      str = new Date().toISOString();
    } else if(config.dateFormat === 'short') {
      const d = new Date();
      const m = d.getMonth()+1;
      const s = d.getSeconds();
      const date = `${d.getDate()}/${m < 10 ? `0${m}` : m}/${d.getFullYear().toString().slice(2)}`;
      const time = `${d.getHours()}:${d.getMinutes()}:${s < 10 ? `0${s}` : s}`;
      str = `${date}-${time}`;
    }
    return LoggerModule.colourise(`${str} `, 'grey');
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
    await this.app.waitForModule('config');
    this.levelsConfig = this.getConfig('levels');
    /**
    * Module configuration options
    * @type {Object}
    */
    this.config = {
      levels: {
        error: {
          enable: this.isLevelEnabled('error'),
          moduleOverrides: this.getModuleOverrides('error'),
          colour: 'red'
        },
        warn: {
          enable: this.isLevelEnabled('warn'),
          moduleOverrides: this.getModuleOverrides('warn'),
          colour: 'yellow'
        },
        success: {
          enable: this.isLevelEnabled('success'),
          moduleOverrides: this.getModuleOverrides('success'),
          colour: 'green'
        },
        info: {
          enable: this.isLevelEnabled('info'),
          moduleOverrides: this.getModuleOverrides('info'),
          colour: 'cyan'
        },
        debug: {
          enable: this.isLevelEnabled('debug'),
          moduleOverrides: this.getModuleOverrides('debug'),
          colour: 'grey'
        }
      },
      timestamp: this.getConfig('showTimestamp'),
      dateFormat: this.getConfig('dateFormat')
    };
    this.setReady();
  }
  isLevelEnabled(level) { // note explicit disable takes preference
    return !this.levelsConfig.includes(`!${level}`) && this.levelsConfig.includes(level);
  }
  getModuleOverrides(level) {
    const levels = [];
    this.levelsConfig.forEach(l => {
      const s = `${level}.`, notS = `!${level}.`;
      if(l.indexOf(s) === 0 || l.indexOf(notS) === 0) levels.push(l);
    });
    return levels;
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
    const { enable, moduleOverrides, colour } = this.config.levels[level];
    const enableOverride = moduleOverrides.includes(`${level}.${id}`);
    const disableOverride = moduleOverrides.includes(`!${level}.${id}`);

    if(disableOverride || !enable && !enableOverride) {
      return;
    }
    const logFunc = console[level] ? console[level] : console.log;
    logFunc(`${LoggerModule.getDateStamp(this.config)}${LoggerModule.colourise(level, colour)} ${LoggerModule.colourise(id, 'magenta')}`, ...args);
  }
}

module.exports = LoggerModule;
