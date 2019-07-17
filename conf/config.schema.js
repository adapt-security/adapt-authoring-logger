module.exports = {
  definition: {
    enabledLevels: {
      type: 'Array',
      default: ['error', 'warn', 'success', 'info', 'debug'],
      description: 'Which levels of log should be enabled'
    },
    showTimestamp: {
      type: 'Boolean',
      default: true,
      description: 'Whether to prepend a timestamp to each log message'
    }
  }
};
