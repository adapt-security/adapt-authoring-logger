import chalk from 'chalk'
/**
 * Colours an input string using a chalk function or colour name
 * @param {String} str The string to colourise
 * @param {String|Function} colourFunc A chalk colour function or string name of a chalk colour
 * @return {String} The colourised string
 * @memberof logger
 */
export function colourise (str, colourFunc) {
  if (typeof colourFunc === 'string') colourFunc = chalk[colourFunc]
  return colourFunc ? colourFunc(str) : str
}
