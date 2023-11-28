const fs = require("fs");

/**
 * Custom error class for options-related errors.
 * 
 * @since 0.0.7
 * @extends Error
 */
class OptionsError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Gets the current date and time in a formatted string.
 * 
 * @since 0.0.7
 * @returns {string} The current date and time.
 */
function getCurrentTime() {
  return new Date().toLocaleString();
}

/**
 * Logs error messages to a file.
 * 
 * @param {...(string|Error|{error: string})} messages - The messages to be logged.
 * @since 0.0.7
 * @throws {Error} Throws an error if there is an issue writing to the log file.
 */
async function logError(...messages) {
  const logFileName = "error.log";
  const currentDatetime = getCurrentTime();
  let errorMessage = `[${currentDatetime}] - `;

  for (const message of messages) {
    if (message instanceof Error) {
      errorMessage += `Error: ${message.message}`;
      if (message.stack) {
        const stackLines = message.stack
          .split("\n")
          .slice(1)
          .map((line) => `${line}`)
          .join("\n");
        errorMessage += `\n${stackLines}\n\n`;
      }
    } else if (typeof message === "string") {
      errorMessage += `${message}\n`;
    } else if (message && message.error) {
      errorMessage += `Error: ${message.error}\n`;
    }
  }

  try {
    await fs.promises.appendFile(logFileName, errorMessage);
  } catch (err) {
    console.error("Error writing to error.log:", err);
  }
}

module.exports = { OptionsError, logError };
