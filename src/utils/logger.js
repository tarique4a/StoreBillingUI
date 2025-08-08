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
    // Disabled logger - no logging in production
  }

  error(message, ...args) {
    // No logging
  }

  warn(message, ...args) {
    // No logging
  }

  info(message, ...args) {
    // No logging
  }

  debug(message, ...args) {
    // No logging
  }

  // API specific logging
  apiRequest(method, url, data = null) {
    // No logging
  }

  apiResponse(method, url, status, data = null) {
    // No logging
  }

  apiError(method, url, error) {
    // No logging
  }

  // Component lifecycle logging
  componentMount(componentName) {
    // No logging
  }

  componentUnmount(componentName) {
    // No logging
  }

  // User action logging
  userAction(action, details = null) {
    // No logging
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;
