import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { getDateStamp } from '../lib/utils/getDateStamp.js'

describe('getDateStamp()', () => {
  it('should return empty string when timestamp is falsy', () => {
    assert.equal(getDateStamp({ timestamp: false, dateFormat: 'iso' }), '')
  })

  it('should return empty string when timestamp is undefined', () => {
    assert.equal(getDateStamp({ dateFormat: 'iso' }), '')
  })

  it('should return an ISO date string when dateFormat is "iso"', () => {
    const result = getDateStamp({ timestamp: true, dateFormat: 'iso' })
    // Result is colourised, so strip ANSI codes for content check
    const stripped = result.replace(/\u001b\[\d+m/g, '')
    // ISO format: YYYY-MM-DDTHH:mm:ss.sssZ followed by a space
    assert.ok(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z /.test(stripped))
  })

  it('should return a short date string when dateFormat is "short"', () => {
    const result = getDateStamp({ timestamp: true, dateFormat: 'short' })
    const stripped = result.replace(/\u001b\[\d+m/g, '')
    // Short format: D/MM/YY-H:M:S followed by a space
    assert.ok(/^\d{1,2}\/\d{2}\/\d{2}-\d{1,2}:\d{1,2}:\d{1,2} /.test(stripped))
  })

  it('should handle unknown dateFormat by returning "undefined " (colourised)', () => {
    const result = getDateStamp({ timestamp: true, dateFormat: 'unknown' })
    const stripped = result.replace(/\u001b\[\d+m/g, '')
    assert.equal(stripped, 'undefined ')
  })
})
