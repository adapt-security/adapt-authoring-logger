import chalk from 'chalk'
import { colourise } from './colourise.js'
/**
 * Returns a formatted date stamp string based on config
 * @param {Object} config Logger configuration object
 * @param {Boolean} config.timestamp Whether to include a timestamp
 * @param {String} config.dateFormat Date format ('iso' or 'short')
 * @return {String} The formatted date stamp (empty string if timestamps disabled)
 * @memberof logger
 */
export function getDateStamp (config) {
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
  return colourise(`${str} `, chalk.dim)
}
