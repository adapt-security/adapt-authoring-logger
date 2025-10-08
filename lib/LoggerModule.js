import { AbstractModule, Hook } from 'adapt-authoring-core'
import chalk from 'chalk'
/**
 * Module for logging message to the console
 * @memberof logger
 * @extends {AbstractModule}
 */
class LoggerModule extends AbstractModule {
  /**
   * Colours an input string
   * @param {String} str
   * @param {String} colour
   * @return {String}
   */
  static colourise (str, colourFunc) {
    if(typeof colourFunc === 'string') colourFunc = chalk[colourFunc]
    return colourFunc ? colourFunc(str) : str
  }

  /**
   * Returns a formatted date stamp
   * @param {Object} config
   * @return {String}
   */
  static getDateStamp (config) {
    if (!config.timestamp) {
      return ''
    }
    let str
    if (config.dateFormat === 'iso') {
      str = new Date().toISOString()
    } else if (config.dateFormat === 'short') {
      const d = new Date()
      const m = d.getMonth() + 1
      const s = d.getSeconds()
      const date = `${d.getDate()}/${m < 10 ? `0${m}` : m}/${d.getFullYear().toString().slice(2)}`
      const time = `${d.getHours()}:${d.getMinutes()}:${s < 10 ? `0${s}` : s}`
      str = `${date}-${time}`
    }
    return LoggerModule.colourise(`${str} `, chalk.grey)
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
    if(this.config.levels.mute) this.log('debug', 'logger', 'MUTED')
    else this.log('debug', 'logger', 'CONFIG_LEVELS', JSON.stringify(Object.entries(this.config.levels).map(([k,v]) => `${k}::${v.enable ? 'ENABLED' : 'DISABLED'}::${v.moduleOverrides}`), null, 2))
    // store instance on main App instance
    this.app.logger = this
  }

  /**
   * Determines whether a specific log level is enabled
   * @param {String} level
   * @return {Boolean}
   */
  isLevelEnabled (level) { // note explicit disable takes preference
    return !this.levelsConfig.includes(`!${level}`) && this.levelsConfig.includes(level)
  }

  /**
   * Returns a list of log levels with overrides, either inclusive or exclusive
   * @param {String} level
   * @return {Array}
   */
  getModuleOverrides (level) {
    const levels = []
    this.levelsConfig.forEach(l => {
      const s = `${level}.`; const notS = `!${level}.`
      if (l.indexOf(s) === 0 || l.indexOf(notS) === 0) levels.push(l)
    })
    return levels
  }

  /**
   * Returns whether a message should be logged (i.e. not disabled in the config)
   * @param {string} level Logging level
   * @param {string} id Id of log caller
   * @returns {boolean}
   */
  isLoggingEnabled (level, id) {
    const { enable, moduleOverrides = [] } = this?.config?.levels[level] || {}
    const isEnabled = enable || moduleOverrides.includes(`${level}.${id}`)
    const disableOverride = moduleOverrides.includes(`!${level}.${id}`)
    return isEnabled && !disableOverride
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
