import { AbstractModule, Hook } from 'adapt-authoring-core'
import chalk from 'chalk'
import { colourise, getDateStamp, getModuleOverrides, isLevelEnabled, isLoggingEnabled } from './utils.js'
/**
 * Module for logging message to the console
 * @memberof logger
 * @extends {AbstractModule}
 */
class LoggerModule extends AbstractModule {
  /**
   * @deprecated Use colourise() from 'adapt-authoring-logger' instead
   */
  static colourise (str, colourFunc) {
    return colourise(str, colourFunc)
  }

  /**
   * @deprecated Use getDateStamp() from 'adapt-authoring-logger' instead
   */
  static getDateStamp (config) {
    return getDateStamp(config)
  }

  /** @override */
  async init () {
    await this.app.waitForModule('config')
    /**
     * Defines what messages are logged
     * @type {Array}
     */
    this.levelsConfig = this.getConfig('levels')
    /**
     * Hook invoked on each message logged
     * @type {Hook}
     */
    this.logHook = new Hook()
    /**
     * Module configuration options
     * @type {Object}
     */
    this.config = {
      levels: {
        error: {
          enable: this.isLevelEnabled('error'),
          moduleOverrides: this.getModuleOverrides('error'),
          colour: chalk.red
        },
        warn: {
          enable: this.isLevelEnabled('warn'),
          moduleOverrides: this.getModuleOverrides('warn'),
          colour: chalk.yellow
        },
        success: {
          enable: this.isLevelEnabled('success'),
          moduleOverrides: this.getModuleOverrides('success'),
          colour: chalk.green
        },
        info: {
          enable: this.isLevelEnabled('info'),
          moduleOverrides: this.getModuleOverrides('info'),
          colour: chalk.cyan
        },
        debug: {
          enable: this.isLevelEnabled('debug'),
          moduleOverrides: this.getModuleOverrides('debug'),
          colour: chalk.dim
        },
        verbose: {
          enable: this.isLevelEnabled('verbose'),
          moduleOverrides: this.getModuleOverrides('verbose'),
          colour: chalk.grey.italic
        }
      },
      timestamp: this.getConfig('showTimestamp'),
      dateFormat: this.getConfig('dateFormat'),
      mute: this.getConfig('mute').toString() === 'true'
    }
    if (this.config.levels.mute) this.log('debug', 'logger', 'MUTED')
    else this.log('debug', 'logger', 'CONFIG_LEVELS', JSON.stringify(Object.entries(this.config.levels).map(([k, v]) => `${k}::${v.enable ? 'ENABLED' : 'DISABLED'}::${v.moduleOverrides}`), null, 2))
    // store instance on main App instance
    this.app.logger = this
  }

  /**
   * @deprecated Use isLevelEnabled() from 'adapt-authoring-logger' instead
   */
  isLevelEnabled (level) {
    return isLevelEnabled(this.levelsConfig, level)
  }

  /**
   * @deprecated Use getModuleOverrides() from 'adapt-authoring-logger' instead
   */
  getModuleOverrides (level) {
    return getModuleOverrides(this.levelsConfig, level)
  }

  /**
   * @deprecated Use isLoggingEnabled() from 'adapt-authoring-logger' instead
   */
  isLoggingEnabled (level, id) {
    return isLoggingEnabled(this.config?.levels, level, id)
  }

  /**
   * Logs a message to the console
   * @param {String} level Severity of the message
   * @param {String} id Identifier for the message. Helps to differentiate between other messages.
   * @param {...*} args Arguments to be logged
   */
  log (level, id, ...args) {
    if (this?.config?.mute?.toString() === 'true') {
      return
    }
    if (id === AbstractModule.MODULE_READY) { // @hack for https://github.com/adaptlearning/adapt-authoring/issues/134 (better than overriding setReady)
      id = this.name.split('-').pop()
      args = [AbstractModule.MODULE_READY, ...args]
    }
    if (!this.isLoggingEnabled(level, id)) {
      return
    }
    const colour = this?.config?.levels[level]?.colour
    const logFunc = console[level] ?? console.log
    logFunc(`${LoggerModule.getDateStamp(this.config)}${LoggerModule.colourise(level, colour)} ${LoggerModule.colourise(id, chalk.magenta)}`, ...args)
    this.logHook.invoke(new Date(), level, id, ...args)
  }
}

export default LoggerModule
