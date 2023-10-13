/**
 * @author Sasprosko
 * @description I coded it to bring the computer back to fast performance, pure, tidy, like when you first bought it. I have absolutely no bad intentions and there is no bad software in the code.
 * @version 0.0.1
 * @copyright (c) 2023 Sasprosko/Umut
 * @license MIT
 * @file LICENSE
 */

const fs = require("fs");
const { exec } = require("child_process");

/**
 * Executes a command and returns the result.
 *
 * @param {string} command - The command to be executed.
 * @param {Object} [options={}] - Execution options.
 * @returns {Promise<Object>} - A promise that resolves with the command execution result.
 */
async function execCommand(command, options = {}) {
  try {
    const result = await new Promise((resolve, reject) => {
      exec(command, { ...options, cwd: __dirname }, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });

    return result;
  } catch (error) {
    console.error("Command error:", error.message);
    throw error;
  }
}

/**
 * Retrieves the default folders based on the current user.
 *
 * @returns {Promise<string[]>} - A promise that resolves with an array of default folders.
 */
async function defaultFolders() {
  try {
    const username = await getUsername();
    if (username) {
      return [
        "c:\\Windows\\Prefetch",
        "c:\\Windows\\Temp",
        `c:\\Users\\${username}\\AppData\\Local\\Temp`,
      ];
    } else {
      console.error(
        "Default folders cannot be initialized due to missing username."
      );
      return [];
    }
  } catch (error) {
    console.error("Error while getting default folders:", error.message);
    return [];
  }
}

/**
 * Gets the current user name.
 *
 * @returns {Promise<string|null>} - A promise that resolves with the username or null if an error occurs.
 */
async function getUsername() {
  try {
    const result = await execCommand("echo %username%");
    const username = result.stdout.toString().trim();

    if (username) {
      console.log("Username retrieved successfully:", username);
      return username;
    } else {
      console.error("Error: Username is empty.");
      return null;
    }
  } catch (error) {
    console.error("Error getting username:", error.message);
    return null;
  }
}

/**
 * Lists files in a given folder.
 *
 * @param {string} folderPath - The path of the folder.
 * @returns {Promise<string[]>} - A promise that resolves with files in the folder.
 */
const listFilesInFolder = async (folderPath) => {
  try {
    const isDirectory = fs.statSync(folderPath).isDirectory();
    if (!isDirectory) return [];

    console.log(`\nFiles in ${folderPath}:`);
    const files = fs.readdirSync(folderPath);
    files.forEach((file) => console.log(file));

    return files;
  } catch (error) {
    console.error(`Error listing files in ${folderPath}:`, error.message);
    return [];
  }
};

/**
 * Deletes files in a given folder.
 *
 * @param {string} filePath - The path of the file.
 */
const deleteFile = async (filePath) => {
  try {
    console.log(`Deleting file: ${filePath}`);
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error.message);
  }
};

/**
 * Opens a tool using the specified command.
 *
 * @param {string} toolCommand - The command to open the tool.
 * @param {string} toolDisplayName - The display name of the tool for logging purposes.
 */
const openTool = async (toolCommand, toolDisplayName) => {
  try {
    await execCommand(toolCommand);
    console.log(`${toolDisplayName} opened successfully.`);
  } catch (error) {
    console.error(`Error opening ${toolDisplayName}:`, error.message);
  }
};

/**
 * Clears specified folders, opens selected tools, and performs additional cleanup actions.
 *
 * @param {Object} [options={}] - Options for controlling the clearing and tool opening process.
 * @param {boolean} [options.openDiskCleaner=false] - Whether to open Disk Cleaner tool.
 * @param {boolean} [options.openMRT=false] - Whether to open Malicious Software Removal Tool (MRT).
 * @param {boolean} [options.openSFC=false] - Whether to run System File Checker (SFC) tool.
 * @param {boolean} [options.openDismRepair=false] - Whether to run Deployment Image Service and Management Tool (DISM).
 * @param {boolean} [options.openDismGetPackages=false] - Whether to run DISM to get a list of installed packages.
 * @param {boolean} [options.openDismAddPackages=false] - Whether to run DISM to add a package.
 */
async function clear({
  openDiskCleaner = false,
  openMRT = false,
  openSFC = false,
  openDismRepair = false,
  openDismGetPackages = false,
  openDismAddPackages = false,
} = {}) {
  // Retrieve default folders
  let folders = await defaultFolders();

  // Open selected tools
  try {
    if (openDiskCleaner) await openTool("cleanmgr.exe", "Disk Cleaner");
    if (openMRT) await openTool("mrt.exe", "MRT");
    if (openSFC)
      await openTool(
        "powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'sfc /scannow' -Wait }\"",
        "'sfc /scannow'"
      );
    if (openDismRepair)
      await openTool(
        "powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'dism /online /cleanup-image /restorehealth /source:C:\\path\\to\\repairsource\\install.wim' -Wait }\"",
        "DISM Repair"
      );
    if (openDismGetPackages)
      await openDismGetPackages(
        "powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'dism /online /get-packages' -Wait }\"",
        "DISM Get Packages"
      );
    if (openDismAddPackages)
      await openDismAddPackages(
        "powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'dism /online /add-package /packagepath:C:\\path\\to\\update.cab' -Wait }\"",
        "DISM Add Packages"
      );
  } catch (error) {
    console.error("Error while opening tools:", error.message);
  }

  // Retrieve files in default folders and delete them
  for (const folder of folders) {
    try {
      const files = await listFilesInFolder(folder);
      for (const file of files) {
        await deleteFile(`${folder}\\${file}`);
      }
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = {
  clear,
};
