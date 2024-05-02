import { PLUGIN_NAME } from "../libs/constants";

class Logger {
  static instance = null; // Holds the singleton instance

  constructor() {
    if (Logger.instance) {
      return Logger.instance; // Return the existing instance if it exists
    }
    Logger.instance = this; // Store the first (and only) instance
  }

  // Generate prefix each time a log method is called
  static getPrefix() {
    return `[${PLUGIN_NAME}] ${new Date().toLocaleString()}`;
  }

  info(...args) {
    console.log(`${Logger.getPrefix()} INFO:`, ...args);
  }

  debug(...args) {
    console.debug(`${Logger.getPrefix()} DEBUG:`, ...args);
  }

  warn(...args) {
    console.warn(`${Logger.getPrefix()} WARN:`, ...args);
  }

  error(...args) {
    console.error(`${Logger.getPrefix()} ERROR:`, ...args);
  }

  static resetInstance() {
    Logger.instance = null;
  }
}

const log = new Logger();
export default log;