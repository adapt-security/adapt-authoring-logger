import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { isLevelEnabled } from '../lib/utils/isLevelEnabled.js'

describe('isLevelEnabled()', () => {
  it('should return true when level is in config', () => {
    assert.equal(isLevelEnabled(['error', 'warn', 'info'], 'error'), true)
  })

  it('should return false when level is not in config', () => {
    assert.equal(isLevelEnabled(['error', 'warn'], 'debug'), false)
  })

  it('should return false when level is explicitly disabled', () => {
    assert.equal(isLevelEnabled(['error', '!warn', 'warn'], 'warn'), false)
  })

  it('should return true when level is present and not explicitly disabled', () => {
    assert.equal(isLevelEnabled(['error', 'warn', '!debug'], 'warn'), true)
  })

  it('should return false for empty config', () => {
    assert.equal(isLevelEnabled([], 'error'), false)
  })

  it('should not match partial level names', () => {
    assert.equal(isLevelEnabled(['error.mymod'], 'error'), false)
  })

  it('should handle explicit disable taking precedence even when level is included', () => {
    assert.equal(isLevelEnabled(['debug', '!debug'], 'debug'), false)
  })
})
