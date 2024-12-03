const fs = require("fs");

/**
 * Custom error class for handling specific options-related errors.
 * Extends the built-in Error class to include additional properties such as error code and module.
 * 
 * @class
 * @extends Error
 * @since 0.0.8
 */
class OptionsError extends Error {
  /**
   * Creates an instance of OptionsError.
   * 
   * @param {string} message - The error message describing the error.
   * @param {string|null} [code=null] - An optional error code. Defaults to "UNKNOWN_ERROR" if not provided.
   * @param {string} [module="General"] - The module where the error occurred, defaulting to "General".
   * @since 0.0.8
   */
  constructor(message, code = null, module = "General") {
    super(message);
    this.name = this.constructor.name;
    this.code = code || "UNKNOWN_ERROR";
    this.module = module || "General";
  }

  /**
   * Custom string representation for the OptionsError.
   * 
   * @returns {string} The error message formatted with the module and code information.
   * @since 0.0.8
   */
  toString() {
    return `${this.name}: [${this.module}] ${this.message} (Code: ${this.code})`;
  }
}

/**
 * Retrieves the current date and time as a formatted string.
 * 
 * This function formats the current date and time based on the local time zone of the system.
 * 
 * @function
 * @returns {string} The current date and time in a locale-specific format (e.g., "12/3/2024, 10:30:45 AM").
 * @since 0.0.8
 * @example
 * const currentTime = getCurrentTime(); // Returns the current date and time.
 */
function getCurrentTime() {
  return new Date().toLocaleString();
}

/**
 * Logs error messages to a file asynchronously.
 * 
 * This function appends error details to the "error.log" file. It supports various types of input, 
 * including Error objects, plain strings, and custom error objects with an "error" property.
 * 
 * The log entry includes the current date and time, error details, and stack trace if available.
 * 
 * @async
 * @function
 * @param {...(string|Error|{error: string})} messages - The error messages or objects to log. 
 * @throws {Error} If there is an issue appending the log entry to the file (e.g., file not found, permission issues).
 * @since 0.0.8
 * 
 * @example
 * // Logs an error with stack trace.
 * await logError(new Error("Something went wrong")); 
 * 
 * @example
 * // Logs a custom error message.
 * await logError("Custom error message encountered");
 * 
 * @example
 * // Logs a custom error object with an 'error' property.
 * await logError({ error: "Custom error object message" });
 */
async function logError(...messages) {
  const logFileName = "error.log";
  const currentDatetime = getCurrentTime();
  let logMessage = `\n[${currentDatetime}] - `;

  // Construct the log message from the provided input(s)
  for (const message of messages) {
    try {
      if (message instanceof Error) {
        // If the message is an Error object, log the message and stack trace
        logMessage += `Error: ${message.message} (Code: ${message.code || "N/A"})`;
        if (message.stack) {
          const stackLines = message.stack
            .split("\n")
            .slice(1)  // Remove the first line that just includes the error type
            .map((line) => line.trim())
            .join("\n");
          logMessage += `\nStack trace:\n${stackLines}\n\n`;
        }
      } else if (typeof message === "string") {
        // If the message is a string, simply log it
        logMessage += `${message}\n`;
      } else if (message && typeof message === "object" && message.error) {
        // If the message is an object with an "error" property, log it
        logMessage += `Error: ${message.error}\n`;
      } else {
        // If the message is of an invalid type, log the type of error encountered
        logMessage += `Invalid message type encountered: ${JSON.stringify(message)}\n`;
      }
    } catch (err) {
      console.error("Error processing message:", err);
    }
  }

  // Check if the log file exists, if not, create it and add an initial log entry
  try {
    const logExists = await fs.promises.stat(logFileName).catch(() => false);
    if (!logExists) {
      const initialLogMessage = `Error log started at: ${getCurrentTime()}\n`;
      await fs.promises.appendFile(logFileName, initialLogMessage);
    }
    await fs.promises.appendFile(logFileName, logMessage);
  } catch (err) {
    console.error("Error writing to error.log:", err);

    // Provide detailed error handling for common issues
    if (err.code === 'ENOENT') {
      throw new Error(`Log file not found: ${logFileName}`);
    } else if (err.code === 'EACCES') {
      throw new Error(`Permission denied when writing to: ${logFileName}`);
    } else {
      throw new Error(`Failed to log error to file: ${err.message}`);
    }
  }
}

module.exports = { OptionsError, logError };
