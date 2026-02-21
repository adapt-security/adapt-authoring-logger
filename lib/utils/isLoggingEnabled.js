/**
 * Returns whether a message should be logged based on the resolved config
 * @param {Object} configLevels The resolved levels config object (e.g. { error: { enable, moduleOverrides }, ... })
 * @param {String} level Logging level (e.g. 'error', 'warn', 'debug')
 * @param {String} id Id of log caller (module name)
 * @returns {Boolean} Whether logging is enabled for this level and caller
 * @memberof logger
 */
export function isLoggingEnabled (configLevels, level, id) {
  const { enable, moduleOverrides = [] } = configLevels?.[level] || {}
  const isEnabled = enable || moduleOverrides.includes(`${level}.${id}`)
  const disableOverride = moduleOverrides.includes(`!${level}.${id}`)
  return isEnabled && !disableOverride
}
