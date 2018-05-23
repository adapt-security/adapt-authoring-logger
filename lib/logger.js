import {DataTypes} from 'adapt-authoring-core';
import chalk from 'chalk';

/**
* Simple logging library
*/
export class Logger extends DataTypes.Module {
  /**
  * Logs a message to the console
  * @param {string} type The type of log. Accepts: warn, error, log.
  * @param {*} msg The message to log
  * @param {*} args Any other arguments
  */
  log(type, msg, ...args) {
    var type = colourise(type.toUpperCase(), type);
    var timestamp = (new Date()).toISOString();
    console.log(`${type} [${timestamp}]: ${msg}`);
  }
}
const COLOUR_MAP = {
  warn: chalk.yellow,
  error: chalk.red
};

function colourise(str, type) {
  const func = COLOUR_MAP[type];
  if(!func) return str;
  return func(str);
}
