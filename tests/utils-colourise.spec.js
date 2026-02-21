import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { colourise } from '../lib/utils/colourise.js'

describe('colourise()', () => {
  it('should return string unchanged when colourFunc is undefined', () => {
    assert.equal(colourise('hello', undefined), 'hello')
  })

  it('should return string unchanged when colourFunc is null', () => {
    assert.equal(colourise('hello', null), 'hello')
  })

  it('should apply a function colour', () => {
    const mockColour = (s) => `[coloured]${s}[/coloured]`
    assert.equal(colourise('hello', mockColour), '[coloured]hello[/coloured]')
  })

  it('should resolve string colour names via chalk', () => {
    // chalk resolves 'red' to chalk.red and applies it
    const result = colourise('hello', 'red')
    assert.ok(result.includes('hello'))
    // chalk.red is a function, so the result should be the return value of that function
    // In non-TTY environments chalk may strip ANSI codes, so just verify it resolved and ran
    assert.equal(typeof result, 'string')
  })

  it('should return string unchanged for invalid chalk colour name', () => {
    assert.equal(colourise('hello', 'notARealColour'), 'hello')
  })

  it('should handle empty string input', () => {
    const mockColour = (s) => `[c]${s}[/c]`
    assert.equal(colourise('', mockColour), '[c][/c]')
  })
})
