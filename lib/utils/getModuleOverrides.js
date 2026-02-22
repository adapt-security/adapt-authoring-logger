/**
 * Returns a list of module-specific log level overrides from the levels config
 * @param {Array<String>} levelsConfig Array of level configuration strings
 * @param {String} level The log level to find overrides for
 * @return {Array<String>} Array of override strings (e.g. ['debug.mymod', '!debug.other'])
 * @memberof logger
 */
export function getModuleOverrides (levelsConfig, level) {
  const levels = []
  levelsConfig.forEach(l => {
    const s = `${level}.`; const notS = `!${level}.`
    if (l.indexOf(s) === 0 || l.indexOf(notS) === 0) levels.push(l)
  })
  return levels
}
