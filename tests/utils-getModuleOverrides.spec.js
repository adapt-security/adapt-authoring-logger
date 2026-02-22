import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { getModuleOverrides } from '../lib/utils/getModuleOverrides.js'

describe('getModuleOverrides()', () => {
  it('should return empty array when no overrides exist', () => {
    assert.deepEqual(getModuleOverrides(['error', 'warn', 'info'], 'debug'), [])
  })

  it('should return module-specific includes', () => {
    const config = ['error', 'debug.mymod', 'debug.other']
    assert.deepEqual(getModuleOverrides(config, 'debug'), ['debug.mymod', 'debug.other'])
  })

  it('should return module-specific excludes', () => {
    const config = ['error', '!debug.mymod']
    assert.deepEqual(getModuleOverrides(config, 'debug'), ['!debug.mymod'])
  })

  it('should return both includes and excludes', () => {
    const config = ['error', 'debug.mymod', '!debug.other', 'debug.third']
    const result = getModuleOverrides(config, 'debug')
    assert.deepEqual(result, ['debug.mymod', '!debug.other', 'debug.third'])
  })

  it('should not include plain level entries', () => {
    const config = ['debug', 'debug.mymod']
    assert.deepEqual(getModuleOverrides(config, 'debug'), ['debug.mymod'])
  })

  it('should not match other levels with similar prefixes', () => {
    const config = ['error.mymod', 'warn.mymod']
    assert.deepEqual(getModuleOverrides(config, 'error'), ['error.mymod'])
  })

  it('should handle empty config', () => {
    assert.deepEqual(getModuleOverrides([], 'error'), [])
  })
})
