/**
 * Determines whether a specific log level is enabled in the levels config
 * @param {Array<String>} levelsConfig Array of level configuration strings
 * @param {String} level The log level to check (e.g. 'error', 'warn', 'debug')
 * @return {Boolean} Whether the level is enabled
 * @memberof logger
 */
export function isLevelEnabled (levelsConfig, level) {
  return !levelsConfig.includes(`!${level}`) && levelsConfig.includes(level)
}
