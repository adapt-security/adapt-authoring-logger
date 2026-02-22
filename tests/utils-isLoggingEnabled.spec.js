import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { isLoggingEnabled } from '../lib/utils/isLoggingEnabled.js'

describe('isLoggingEnabled()', () => {
  it('should return true when level is globally enabled', () => {
    const levels = { error: { enable: true, moduleOverrides: [] } }
    assert.equal(isLoggingEnabled(levels, 'error', 'mymod'), true)
  })

  it('should return false when level is globally disabled and no override', () => {
    const levels = { error: { enable: false, moduleOverrides: [] } }
    assert.equal(isLoggingEnabled(levels, 'error', 'mymod'), false)
  })

  it('should return true when module has an include override', () => {
    const levels = { debug: { enable: false, moduleOverrides: ['debug.mymod'] } }
    assert.equal(isLoggingEnabled(levels, 'debug', 'mymod'), true)
  })

  it('should return false when module has a disable override', () => {
    const levels = { error: { enable: true, moduleOverrides: ['!error.mymod'] } }
    assert.equal(isLoggingEnabled(levels, 'error', 'mymod'), false)
  })

  it('should return false when both include and disable override exist', () => {
    const levels = { debug: { enable: false, moduleOverrides: ['debug.mymod', '!debug.mymod'] } }
    assert.equal(isLoggingEnabled(levels, 'debug', 'mymod'), false)
  })

  it('should return false when level is not in config', () => {
    const levels = { error: { enable: true, moduleOverrides: [] } }
    assert.equal(isLoggingEnabled(levels, 'debug', 'mymod'), false)
  })

  it('should handle null/undefined configLevels gracefully', () => {
    assert.equal(isLoggingEnabled(null, 'error', 'mymod'), false)
    assert.equal(isLoggingEnabled(undefined, 'error', 'mymod'), false)
  })

  it('should default moduleOverrides to empty array when missing', () => {
    const levels = { error: { enable: true } }
    assert.equal(isLoggingEnabled(levels, 'error', 'mymod'), true)
  })

  it('should not match overrides for different modules', () => {
    const levels = { debug: { enable: false, moduleOverrides: ['debug.other'] } }
    assert.equal(isLoggingEnabled(levels, 'debug', 'mymod'), false)
  })
})
