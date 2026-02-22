import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { getDateStamp } from '../lib/utils/getDateStamp.js'

// eslint-disable-next-line no-control-regex
const ANSI_REGEX = /\u001b\[\d+m/g

describe('getDateStamp()', () => {
  it('should return empty string when timestamp is falsy', () => {
    assert.equal(getDateStamp({ timestamp: false, dateFormat: 'iso' }), '')
  })

  it('should return empty string when timestamp is undefined', () => {
    assert.equal(getDateStamp({ dateFormat: 'iso' }), '')
  })

  it('should return an ISO date string when dateFormat is "iso"', () => {
    const result = getDateStamp({ timestamp: true, dateFormat: 'iso' })
    const stripped = result.replace(ANSI_REGEX, '')
    assert.ok(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z /.test(stripped))
  })

  it('should return a short date string when dateFormat is "short"', () => {
    const result = getDateStamp({ timestamp: true, dateFormat: 'short' })
    const stripped = result.replace(ANSI_REGEX, '')
    assert.ok(/^\d{1,2}\/\d{2}\/\d{2}-\d{1,2}:\d{1,2}:\d{1,2} /.test(stripped))
  })

  it('should handle unknown dateFormat by returning "undefined " (colourised)', () => {
    const result = getDateStamp({ timestamp: true, dateFormat: 'unknown' })
    const stripped = result.replace(ANSI_REGEX, '')
    assert.equal(stripped, 'undefined ')
  })
})
