const { Singleton, Utils } = require('adapt-authoring-core');
const Logger = require('./lib/logger');
module.exports = Utils.compose(Logger, Singleton);
