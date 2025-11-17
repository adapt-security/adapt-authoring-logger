import assert from 'assert'
import { describe, it, beforeEach, afterEach } from 'node:test'
import chalk from 'chalk'
import LoggerModule from '../lib/LoggerModule.js'

describe('LoggerModule', () => {
  describe('colourise()', () => {
    it('should return string with colour function applied', () => {
      const result = LoggerModule.colourise('test', chalk.red)
      assert.ok(result.includes('test'))
    })

    it('should accept colour name as string', () => {
      const result = LoggerModule.colourise('test', 'green')
      assert.ok(result.includes('test'))
    })

    it('should return uncoloured string if no colour function provided', () => {
      const result = LoggerModule.colourise('test', null)
      assert.strictEqual(result, 'test')
    })

    it('should handle undefined colour function', () => {
      const result = LoggerModule.colourise('test', undefined)
      assert.strictEqual(result, 'test')
    })
  })

  describe('getDateStamp()', () => {
    it('should return empty string when timestamp is disabled', () => {
      const config = { timestamp: false }
      const result = LoggerModule.getDateStamp(config)
      assert.strictEqual(result, '')
    })

    it('should return ISO format date when dateFormat is "iso"', () => {
      const config = { timestamp: true, dateFormat: 'iso' }
      const result = LoggerModule.getDateStamp(config)
      assert.ok(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(result))
    })

    it('should return short format date when dateFormat is "short"', () => {
      const config = { timestamp: true, dateFormat: 'short' }
      const result = LoggerModule.getDateStamp(config)
      assert.ok(/\d{1,2}\/\d{2}\/\d{2}-\d{2}:\d{2}:\d{2}/.test(result))
    })
  })

  describe('isLevelEnabled()', () => {
    let logger

    beforeEach(() => {
      logger = new LoggerModule('test-logger')
      logger.levelsConfig = ['error', 'warn', 'info']
    })

    it('should return true for enabled levels', () => {
      assert.strictEqual(logger.isLevelEnabled('error'), true)
      assert.strictEqual(logger.isLevelEnabled('warn'), true)
      assert.strictEqual(logger.isLevelEnabled('info'), true)
    })

    it('should return false for disabled levels', () => {
      assert.strictEqual(logger.isLevelEnabled('debug'), false)
      assert.strictEqual(logger.isLevelEnabled('verbose'), false)
    })

    it('should return false when level is explicitly disabled', () => {
      logger.levelsConfig = ['error', '!warn', 'info']
      assert.strictEqual(logger.isLevelEnabled('warn'), false)
    })

    it('should give preference to explicit disable', () => {
      logger.levelsConfig = ['warn', '!warn']
      assert.strictEqual(logger.isLevelEnabled('warn'), false)
    })
  })

  describe('getModuleOverrides()', () => {
    let logger

    beforeEach(() => {
      logger = new LoggerModule('test-logger')
    })

    it('should return module-specific overrides for a level', () => {
      logger.levelsConfig = ['error', 'error.myModule', 'error.anotherModule', 'warn']
      const result = logger.getModuleOverrides('error')
      assert.ok(result.includes('error.myModule'))
      assert.ok(result.includes('error.anotherModule'))
      assert.strictEqual(result.length, 2)
    })

    it('should include negative overrides', () => {
      logger.levelsConfig = ['error', '!error.myModule']
      const result = logger.getModuleOverrides('error')
      assert.ok(result.includes('!error.myModule'))
    })

    it('should return empty array when no overrides exist', () => {
      logger.levelsConfig = ['error', 'warn']
      const result = logger.getModuleOverrides('info')
      assert.strictEqual(result.length, 0)
    })

    it('should not include overrides for other levels', () => {
      logger.levelsConfig = ['error', 'error.moduleA', 'warn.moduleB']
      const result = logger.getModuleOverrides('error')
      assert.ok(!result.includes('warn.moduleB'))
    })
  })

  describe('isLoggingEnabled()', () => {
    let logger

    beforeEach(() => {
      logger = new LoggerModule('test-logger')
      logger.config = {
        levels: {
          error: { enable: true, moduleOverrides: [] },
          warn: { enable: false, moduleOverrides: ['warn.specific'] },
          info: { enable: true, moduleOverrides: ['!info.blocked'] }
        }
      }
    })

    it('should return true for enabled levels', () => {
      assert.strictEqual(logger.isLoggingEnabled('error', 'anyId'), true)
    })

    it('should return false for disabled levels without overrides', () => {
      assert.strictEqual(logger.isLoggingEnabled('warn', 'generic'), false)
    })

    it('should return true for disabled level with positive override', () => {
      assert.strictEqual(logger.isLoggingEnabled('warn', 'specific'), true)
    })

    it('should return false for enabled level with negative override', () => {
      assert.strictEqual(logger.isLoggingEnabled('info', 'blocked'), false)
    })

    it('should return true for enabled level without override', () => {
      assert.strictEqual(logger.isLoggingEnabled('info', 'allowed'), true)
    })

    it('should handle missing level config gracefully', () => {
      assert.strictEqual(logger.isLoggingEnabled('nonexistent', 'id'), false)
    })
  })

  describe('log()', () => {
    let logger
    let logOutput
    let originalConsoleLog

    beforeEach(() => {
      logger = new LoggerModule('test-logger')
      logger.config = {
        levels: {
          error: { enable: true, moduleOverrides: [], colour: chalk.red },
          warn: { enable: true, moduleOverrides: [], colour: chalk.yellow },
          info: { enable: true, moduleOverrides: [], colour: chalk.cyan },
          debug: { enable: true, moduleOverrides: [], colour: chalk.dim }
        },
        timestamp: false,
        dateFormat: 'iso',
        mute: false
      }
      logger.logHook = { invoke: () => {} }
      logOutput = []

      originalConsoleLog = console.log
      console.log = (...args) => logOutput.push({ level: 'log', args })
      console.error = (...args) => logOutput.push({ level: 'error', args })
      console.warn = (...args) => logOutput.push({ level: 'warn', args })
      console.info = (...args) => logOutput.push({ level: 'info', args })
    })

    afterEach(() => {
      console.log = originalConsoleLog
    })

    it('should not log when muted', () => {
      logger.config.mute = true
      logger.log('info', 'test', 'message')
      assert.strictEqual(logOutput.length, 0)
    })

    it('should not log when level is disabled', () => {
      logger.config.levels.debug.enable = false
      logger.log('debug', 'test', 'message')
      assert.strictEqual(logOutput.length, 0)
    })

    it('should log message when enabled', () => {
      logger.log('info', 'testId', 'test message')
      assert.strictEqual(logOutput.length, 1)
      assert.ok(logOutput[0].args.some(arg => typeof arg === 'string' && arg.includes('testId')))
    })

    it('should include multiple arguments', () => {
      logger.log('info', 'test', 'arg1', 'arg2', 'arg3')
      assert.strictEqual(logOutput.length, 1)
      const args = logOutput[0].args
      assert.ok(args.includes('arg1'))
      assert.ok(args.includes('arg2'))
      assert.ok(args.includes('arg3'))
    })

    it('should use correct console method for level', () => {
      logger.log('error', 'test', 'message')
      assert.strictEqual(logOutput[0].level, 'error')
    })

    it('should invoke logHook with correct parameters', () => {
      let hookArgs = null
      logger.logHook.invoke = (...args) => {
        hookArgs = args
      }
      logger.log('info', 'testId', 'message')
      assert.ok(hookArgs)
      assert.strictEqual(hookArgs[1], 'info')
      assert.strictEqual(hookArgs[2], 'testId')
      assert.strictEqual(hookArgs[3], 'message')
    })

    it('should colorise level in output', () => {
      logger.log('info', 'test', 'message')
      assert.strictEqual(logOutput.length, 1)
      assert.ok(logOutput[0].args[0].includes('info'))
    })

    it('should colorise id in output', () => {
      logger.log('info', 'myModule', 'message')
      assert.strictEqual(logOutput.length, 1)
      assert.ok(logOutput[0].args[0].includes('myModule'))
    })
  })
})
