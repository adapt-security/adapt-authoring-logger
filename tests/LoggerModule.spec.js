import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import chalk from 'chalk'
import { AbstractModule } from 'adapt-authoring-core'
import LoggerModule from '../lib/LoggerModule.js'
import { colourise, getDateStamp, isLevelEnabled, getModuleOverrides, isLoggingEnabled } from '../lib/utils.js'

describe('LoggerModule', () => {
  describe('colourise()', () => {
    it('should return string with colour function applied', () => {
      const result = colourise('test', chalk.red)
      assert.ok(result.includes('test'))
    })

    it('should accept colour name as string', () => {
      const result = colourise('test', 'green')
      assert.ok(result.includes('test'))
    })

    it('should return uncoloured string if no colour function provided', () => {
      const result = colourise('test', null)
      assert.equal(result, 'test')
    })

    it('should handle undefined colour function', () => {
      const result = colourise('test', undefined)
      assert.equal(result, 'test')
    })

    it('should return empty string unchanged when no colour', () => {
      const result = colourise('', null)
      assert.equal(result, '')
    })

    it('should apply colour function to empty string', () => {
      const result = colourise('', chalk.red)
      assert.equal(typeof result, 'string')
    })
  })

  describe('getDateStamp()', () => {
    it('should return empty string when timestamp is disabled', () => {
      const config = { timestamp: false }
      const result = getDateStamp(config)
      assert.equal(result, '')
    })

    it('should return ISO format date when dateFormat is "iso"', () => {
      const config = { timestamp: true, dateFormat: 'iso' }
      const result = getDateStamp(config)
      assert.ok(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(result))
    })

    it('should return short format date when dateFormat is "short"', () => {
      const config = { timestamp: true, dateFormat: 'short' }
      const result = getDateStamp(config)
      assert.ok(/\d{1,2}\/\d{2}\/\d{2}-\d{1,2}:\d{1,2}:\d{2}/.test(result))
    })

    it('should return undefined-based string for unrecognised dateFormat', () => {
      const config = { timestamp: true, dateFormat: 'unknown' }
      const result = getDateStamp(config)
      assert.ok(result.includes('undefined'))
    })

    it('should include trailing space in formatted timestamp', () => {
      const config = { timestamp: true, dateFormat: 'iso' }
      const result = getDateStamp(config)
      assert.ok(result.includes(' '))
    })
  })

  describe('isLevelEnabled()', () => {
    it('should return true for enabled levels', () => {
      const levelsConfig = ['error', 'warn', 'info']
      assert.equal(isLevelEnabled(levelsConfig, 'error'), true)
      assert.equal(isLevelEnabled(levelsConfig, 'warn'), true)
      assert.equal(isLevelEnabled(levelsConfig, 'info'), true)
    })

    it('should return false for disabled levels', () => {
      const levelsConfig = ['error', 'warn', 'info']
      assert.equal(isLevelEnabled(levelsConfig, 'debug'), false)
      assert.equal(isLevelEnabled(levelsConfig, 'verbose'), false)
    })

    it('should return false when level is explicitly disabled', () => {
      const levelsConfig = ['error', '!warn', 'info']
      assert.equal(isLevelEnabled(levelsConfig, 'warn'), false)
    })

    it('should give preference to explicit disable', () => {
      const levelsConfig = ['warn', '!warn']
      assert.equal(isLevelEnabled(levelsConfig, 'warn'), false)
    })

    it('should return false for empty levelsConfig', () => {
      assert.equal(isLevelEnabled([], 'error'), false)
    })

    it('should not match partial level names', () => {
      const levelsConfig = ['info']
      assert.equal(isLevelEnabled(levelsConfig, 'inf'), false)
      assert.equal(isLevelEnabled(levelsConfig, 'information'), false)
    })
  })

  describe('getModuleOverrides()', () => {
    it('should return module-specific overrides for a level', () => {
      const levelsConfig = ['error', 'error.myModule', 'error.anotherModule', 'warn']
      const result = getModuleOverrides(levelsConfig, 'error')
      assert.ok(result.includes('error.myModule'))
      assert.ok(result.includes('error.anotherModule'))
      assert.equal(result.length, 2)
    })

    it('should include negative overrides', () => {
      const levelsConfig = ['error', '!error.myModule']
      const result = getModuleOverrides(levelsConfig, 'error')
      assert.ok(result.includes('!error.myModule'))
    })

    it('should return empty array when no overrides exist', () => {
      const levelsConfig = ['error', 'warn']
      const result = getModuleOverrides(levelsConfig, 'info')
      assert.equal(result.length, 0)
    })

    it('should not include overrides for other levels', () => {
      const levelsConfig = ['error', 'error.moduleA', 'warn.moduleB']
      const result = getModuleOverrides(levelsConfig, 'error')
      assert.ok(!result.includes('warn.moduleB'))
    })

    it('should return both positive and negative overrides together', () => {
      const levelsConfig = ['error', 'error.modA', '!error.modB']
      const result = getModuleOverrides(levelsConfig, 'error')
      assert.equal(result.length, 2)
      assert.ok(result.includes('error.modA'))
      assert.ok(result.includes('!error.modB'))
    })

    it('should return empty array for empty levelsConfig', () => {
      assert.deepEqual(getModuleOverrides([], 'error'), [])
    })
  })

  describe('isLoggingEnabled()', () => {
    it('should return true for enabled levels', () => {
      const levels = { error: { enable: true, moduleOverrides: [] } }
      assert.equal(isLoggingEnabled(levels, 'error', 'anyId'), true)
    })

    it('should return false for disabled levels without overrides', () => {
      const levels = { warn: { enable: false, moduleOverrides: ['warn.specific'] } }
      assert.equal(isLoggingEnabled(levels, 'warn', 'generic'), false)
    })

    it('should return true for disabled level with positive override', () => {
      const levels = { warn: { enable: false, moduleOverrides: ['warn.specific'] } }
      assert.equal(isLoggingEnabled(levels, 'warn', 'specific'), true)
    })

    it('should return false for enabled level with negative override', () => {
      const levels = { info: { enable: true, moduleOverrides: ['!info.blocked'] } }
      assert.equal(isLoggingEnabled(levels, 'info', 'blocked'), false)
    })

    it('should return true for enabled level without override', () => {
      const levels = { info: { enable: true, moduleOverrides: ['!info.blocked'] } }
      assert.equal(isLoggingEnabled(levels, 'info', 'allowed'), true)
    })

    it('should handle missing level config gracefully', () => {
      const levels = { error: { enable: true, moduleOverrides: [] } }
      assert.equal(isLoggingEnabled(levels, 'nonexistent', 'id'), false)
    })

    it('should default moduleOverrides to empty array when undefined', () => {
      const levels = { error: { enable: true } }
      assert.equal(isLoggingEnabled(levels, 'error', 'anyId'), true)
    })

    it('should return false when both enable is false and no matching override', () => {
      const levels = { debug: { enable: false, moduleOverrides: ['debug.other'] } }
      assert.equal(isLoggingEnabled(levels, 'debug', 'notOther'), false)
    })

    it('should handle config being undefined gracefully', () => {
      assert.equal(isLoggingEnabled(undefined, 'error', 'id'), false)
    })
  })

  describe('#log()', () => {
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
      assert.equal(logOutput.length, 0)
    })

    it('should not log when level is disabled', () => {
      logger.config.levels.debug.enable = false
      logger.log('debug', 'test', 'message')
      assert.equal(logOutput.length, 0)
    })

    it('should log message when enabled', () => {
      logger.log('info', 'testId', 'test message')
      assert.equal(logOutput.length, 1)
      assert.ok(logOutput[0].args.some(arg => typeof arg === 'string' && arg.includes('testId')))
    })

    it('should include multiple arguments', () => {
      logger.log('info', 'test', 'arg1', 'arg2', 'arg3')
      assert.equal(logOutput.length, 1)
      const args = logOutput[0].args
      assert.ok(args.includes('arg1'))
      assert.ok(args.includes('arg2'))
      assert.ok(args.includes('arg3'))
    })

    it('should use correct console method for level', () => {
      logger.log('error', 'test', 'message')
      assert.equal(logOutput[0].level, 'error')
    })

    it('should invoke logHook with correct parameters', () => {
      let hookArgs = null
      logger.logHook.invoke = (...args) => {
        hookArgs = args
      }
      logger.log('info', 'testId', 'message')
      assert.ok(hookArgs)
      assert.equal(hookArgs[1], 'info')
      assert.equal(hookArgs[2], 'testId')
      assert.equal(hookArgs[3], 'message')
    })

    it('should colorise level in output', () => {
      logger.log('info', 'test', 'message')
      assert.equal(logOutput.length, 1)
      assert.ok(logOutput[0].args[0].includes('info'))
    })

    it('should colorise id in output', () => {
      logger.log('info', 'myModule', 'message')
      assert.equal(logOutput.length, 1)
      assert.ok(logOutput[0].args[0].includes('myModule'))
    })

    it('should treat string "true" mute value as muted', () => {
      logger.config.mute = 'true'
      logger.log('info', 'test', 'message')
      assert.equal(logOutput.length, 0)
    })

    it('should not mute when mute is "false"', () => {
      logger.config.mute = 'false'
      logger.log('info', 'test', 'message')
      assert.equal(logOutput.length, 1)
    })

    it('should fall back to console.log for unknown level', () => {
      logger.config.levels.success = { enable: true, moduleOverrides: [], colour: chalk.green }
      logger.log('success', 'test', 'message')
      assert.equal(logOutput.length, 1)
      assert.equal(logOutput[0].level, 'log')
    })

    it('should handle MODULE_READY id by using module name suffix', () => {
      logger.name = 'adapt-authoring-logger'
      logger.config.levels.verbose = { enable: true, moduleOverrides: [], colour: chalk.grey }
      let hookArgs = null
      logger.logHook.invoke = (...args) => { hookArgs = args }
      logger.log('verbose', AbstractModule.MODULE_READY, 'some-init-time')
      assert.equal(logOutput.length, 1)
      assert.ok(logOutput[0].args[0].includes('logger'))
      assert.equal(hookArgs[2], 'logger')
      assert.equal(hookArgs[3], AbstractModule.MODULE_READY)
      assert.equal(hookArgs[4], 'some-init-time')
    })

    it('should prepend date stamp when timestamp is enabled', () => {
      logger.config.timestamp = true
      logger.config.dateFormat = 'iso'
      logger.log('info', 'test', 'message')
      assert.equal(logOutput.length, 1)
      assert.ok(/\d{4}-\d{2}-\d{2}T/.test(logOutput[0].args[0]))
    })

    it('should pass Date as first argument to logHook', () => {
      let hookArgs = null
      logger.logHook.invoke = (...args) => { hookArgs = args }
      logger.log('info', 'test', 'message')
      assert.ok(hookArgs[0] instanceof Date)
    })

    it('should handle config being undefined gracefully', () => {
      logger.config = undefined
      assert.doesNotThrow(() => logger.log('info', 'test', 'message'))
    })
  })
})
