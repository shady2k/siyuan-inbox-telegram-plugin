import { PLUGIN_NAME } from "../libs/constants";
class Logger {
  static instance = null; // Holds the singleton instance
  static prefix;

  constructor() {
    if (Logger.instance) {
      return Logger.instance; // Return the existing instance if it exists
    }
    Logger.instance = this; // Store the first (and only) instance
    Logger.prefix = `[${PLUGIN_NAME}]`
  }

  info(...args) {
    console.log(`${Logger.prefix} INFO:`, ...args);
  }

  debug(...args) {
    console.debug(`${Logger.prefix} DEBUG:`, ...args);
  }

  warn(...args) {
    console.warn(`${Logger.prefix} WARN:`, ...args);
  }

  error(...args) {
    console.error(`${Logger.prefix} ERROR:`, ...args);
  }
  static resetInstance() {
    Logger.instance = null;
  }
}

const log = new Logger();
export default log;