/**
 * Centralized logging utility for the application
 * Provides different log levels and can be configured for production
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  constructor() {
    // Set log level based on environment
    this.logLevel = process.env.NODE_ENV === 'production' ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;
  }

  error(message, ...args) {
    if (this.logLevel >= LOG_LEVELS.ERROR) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  warn(message, ...args) {
    if (this.logLevel >= LOG_LEVELS.WARN) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  info(message, ...args) {
    if (this.logLevel >= LOG_LEVELS.INFO) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  debug(message, ...args) {
    if (this.logLevel >= LOG_LEVELS.DEBUG) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  // API specific logging
  apiRequest(method, url, data = null) {
    this.debug(`API Request: ${method.toUpperCase()} ${url}`, data);
  }

  apiResponse(method, url, status, data = null) {
    this.debug(`API Response: ${method.toUpperCase()} ${url} - ${status}`, data);
  }

  apiError(method, url, error) {
    this.error(`API Error: ${method.toUpperCase()} ${url}`, error);
  }

  // Component lifecycle logging
  componentMount(componentName) {
    this.debug(`Component mounted: ${componentName}`);
  }

  componentUnmount(componentName) {
    this.debug(`Component unmounted: ${componentName}`);
  }

  // User action logging
  userAction(action, details = null) {
    this.info(`User action: ${action}`, details);
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;
