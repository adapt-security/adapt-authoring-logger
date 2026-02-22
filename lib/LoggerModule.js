import { AbstractModule, Hook } from 'adapt-authoring-core'
import chalk from 'chalk'
import { colourise, getDateStamp, getModuleOverrides, isLevelEnabled, isLoggingEnabled } from './utils.js'
/**
 * Module for logging message to the console
 * @memberof logger
 * @extends {AbstractModule}
 */
class LoggerModule extends AbstractModule {
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
          enable: isLevelEnabled(this.levelsConfig, 'error'),
          moduleOverrides: getModuleOverrides(this.levelsConfig, 'error'),
          colour: chalk.red
        },
        warn: {
          enable: isLevelEnabled(this.levelsConfig, 'warn'),
          moduleOverrides: getModuleOverrides(this.levelsConfig, 'warn'),
          colour: chalk.yellow
        },
        success: {
          enable: isLevelEnabled(this.levelsConfig, 'success'),
          moduleOverrides: getModuleOverrides(this.levelsConfig, 'success'),
          colour: chalk.green
        },
        info: {
          enable: isLevelEnabled(this.levelsConfig, 'info'),
          moduleOverrides: getModuleOverrides(this.levelsConfig, 'info'),
          colour: chalk.cyan
        },
        debug: {
          enable: isLevelEnabled(this.levelsConfig, 'debug'),
          moduleOverrides: getModuleOverrides(this.levelsConfig, 'debug'),
          colour: chalk.dim
        },
        verbose: {
          enable: isLevelEnabled(this.levelsConfig, 'verbose'),
          moduleOverrides: getModuleOverrides(this.levelsConfig, 'verbose'),
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
    if (!isLoggingEnabled(this.config?.levels, level, id)) {
      return
    }
    const colour = this?.config?.levels[level]?.colour
    const logFunc = console[level] ?? console.log
    logFunc(`${getDateStamp(this.config)}${colourise(level, colour)} ${colourise(id, chalk.magenta)}`, ...args)
    this.logHook.invoke(new Date(), level, id, ...args)
  }
}

export default LoggerModule
