/*Version 0.0.7*/

const https = require("https");
const fs = require("fs");
const { exec } = require("child_process");
const UserAgent = require("user-agents");
const OptionsError = require("../errors/error.js").OptionsError;
const logError = require("../errors/error.js").logError;

/**
 * Node.js version check.
 *
 * @since 0.0.6
 * @throws {Error} Throws an error if the Node.js version is too old.
 */
const nodeVersion = Number(process.versions.node.split(".")[0]);
try {
  if (nodeVersion < 10) {
    throw new Error(`Your Node.js version \x1b[31m${process.version}\x1b[0m is too old. Please update it: https://nodejs.org/en`);
  }
} catch (error) {
  logError(error);
}
/**
 * Generates a random user agent string.
 *
 * @since 0.0.5
 * @returns {Promise<string>} A promise that resolves with a random user agent string.
 */
async function RandomUserAgent() {
  const userAgent = new UserAgent();
  return userAgent.toString();
}

/**
 * Checks the latest version of a GitHub repository.
 *
 * @since 0.0.5
 * @throws {Error} Throws an error if there is an issue with the GitHub API or if the response is invalid.
 */
async function checkLatestVersion() {
  try {
    const headers = {
      "User-Agent": await RandomUserAgent(),
    };

    https.get({ hostname: "api.github.com", path: "/repos/sasprosko590/SASPClean/releases/latest", headers }, (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        try {
          if (response.statusCode !== 200 || !response.headers["content-type"].includes("application/json")) {
            throw new Error(`Invalid response. Status code: ${response.statusCode}`);
          }

          const parsedData = JSON.parse(data);
          const latestVersion = parsedData.tag_name;
          console.log("Latest version:", latestVersion);
          const str = String("\u0056\u0030\u002e\u0030\u002e\u0037");
          
          if (latestVersion !== str) {
            console.log("The project is \x1b[31mout of date.\x1b[0m");
            console.log("https://github.com/sasprosko590/SASPClean")
          } else {
            console.log("The project is \x1b[32mup to date.\x1b[0m");
          }
        } catch (error) {
          logError("GitHub API Error:", error);
        }
      });
    })
    .on("error", (error) => {
      logError("HTTP GET error:", error);
    });
  } catch (error) {
    logError("Error:", error);
  }
}

/**
 * Executes a command and returns the result.
 *
 * @since 0.0.1
 * @param {string} command - The command to be executed.
 * @param {Object} [options={}] - Execution options.
 * @returns {Promise<Object>} A promise that resolves with the command execution result.
 * @throws {Error} Throws an error if the command execution fails.
 */
async function execCommand(command, options = {}) {
  try {
    return await new Promise((resolve, reject) => {
      exec(command, { ...options, cwd: __dirname }, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  } catch (error) {
    logError("Command error:", error);
    return;
  }
}

/**
 * Retrieves the default folders based on the current user.
 *
 * @since 0.0.1
 * @returns {Promise<string[]>} A promise that resolves with an array of default folders.
 * @throws {Error} Throws an error if there is an issue retrieving the default folders.
 */
async function getDefaultFolders() {
  try {
    const username = await getUsername();
    if (username) {
      return [
        "c:\\Windows\\Prefetch",
        "c:\\Windows\\Temp",
        `c:\\Users\\${username}\\AppData\\Local\\Temp`,
      ];
    } else {
      logError(
        "Default folders cannot be initialized due to missing username."
      );
      return [];
    }
  } catch (error) {
    logError("Error while getting default folders:", error);
    return [];
  }
}

/**
 * Gets the current user name.
 *
 * @since 0.0.1
 * @returns {Promise<string|null>} A promise that resolves with the username or null if an error occurs.
 * @throws {Error} Throws an error if there is an issue retrieving the username.
 */
async function getUsername() {
  try {
    const whoamiResult = await execCommand("whoami");
    let username, extractedPart;

    if (whoamiResult && whoamiResult.stdout) {
      username = whoamiResult.stdout.toString().trim();
    } else {
      const echoResult = await execCommand("echo %username%");

      if (echoResult && echoResult.stdout) {
        username = echoResult.stdout.toString().trim();
      } else {
        logError("Error: The echo command to get the username failed.");
        return null;
      }
    }

    const index = username.indexOf("\\");
    extractedPart = index !== -1 ? username.substring(index + 1) : username;
    return extractedPart;
  } catch (error) {
    logError("Error retrieving username:", error);
    return null;
  }
}

/**
 * Checks if a folder exists.
 *
 * @since 0.0.1
 * @param {string} folderPath - The path of the folder.
 * @returns {Promise<boolean>} - A promise that resolves with true if the folder exists, false otherwise.
 * @throws {Error} Throws an error if there is an issue checking the existence of the folder.
 */
async function FolderExists(folderPath) {
  try {
    await fs.promises.access(folderPath, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Lists files in a given folder.
 *
 * @since 0.0.1
 * @param {string} folderPath - The path of the folder.
 * @returns {Promise<string[]>} - A promise that resolves with files in the folder.
 * @throws {Error} Throws an error if there is an issue listing files in the folder.
 */
async function listFilesInFolder(folderPath) {
  try {
    const folderExists = await FolderExists(folderPath);
    if (!folderExists) {
      console.log(`Folder does not exist: \x1b[31m${folderPath}\x1b[0m`);
      return [];
    }

    const files = await fs.promises.readdir(folderPath);
    console.log(`\nFiles in ${folderPath}:`);
    return files.map(file => file);
  } catch (error) {
    console.log(`Error listing files in \x1b[31m${folderPath}\x1b[0m:`, error);
    return [];
  }
}

let successfulDeletions = 0;

/**
 * Deletes a file asynchronously.
 *
 * @since 0.0.1
 * @param {string} filePath - The path of the file.
 * @returns {Promise<void>} - A promise that resolves after the file is deleted.
 * @throws {Error} Throws an error if there is an issue deleting the file.
 */
async function deleteFile(filePath) {
  try {
    const fileExists = await FolderExists(filePath);
    if (fileExists) {
      await fs.promises.unlink(filePath);
      successfulDeletions++;
      console.log(`File deleted successfully: \x1b[32m${filePath}\x1b[0m`);
    } else {
      console.log(`File does not exist: \x1b[31m${filePath}\x1b[0m`);
    }
  } catch (error) {
    logError(`Error deleting file asynchronously: ${error}`);
  }
}

/**
 * Opens a tool using the specified command.
 *
 * @since 0.0.1
 * @param {string} toolCommand - The command to open the tool.
 * @param {string} toolDisplayName - The display name of the tool for logging purposes.
 * @throws {Error} Throws an error if there is an issue opening the tool.
 */
async function openTool(toolCommand, toolDisplayName) {
  try {
    const terminalCommand = process.platform === "win32" ? `start cmd /c ${toolCommand}` : toolCommand;
    await new Promise((resolve, reject) => {
      execCommand(terminalCommand)
        .then(() => {
          console.log(`\x1b[32m${toolDisplayName}\x1b[0m opened successfully.`);
          resolve();
        })
        .catch(error => {
          logError(`Error opening ${toolDisplayName}:`, error);
          reject(error);
        });
    });
  } catch (error) {
    logError(`Error opening ${toolDisplayName}:`, error);
  }
}

/**
 * Clears specified folders, opens selected tools, and performs additional cleanup actions.
 * @since 0.0.1
 * @param {Object} [options={}] - Options for controlling the clearing and tool opening process.
 * @param {boolean} [options.clearSpotifyData=false] - Whether to clear Spotify data.
 * @param {boolean} [options.clearWindows10Upgrade=false] - Whether to clear the Windows10Upgrade folder.
 * @param {boolean} [options.clearWindowsOld=false] - Whether to clear the Windows.old folder.
 * @param {boolean} [options.clearWindowsUpdate=false] - Whether Windows Update will be cleaned.
 * @param {boolean} [options.openCDF=false] - Whether to open the Change Directory Fast (CDF) tool.
 * @param {boolean} [options.openCDR=false] - Whether to open the Change Directory Recursive (CDR) tool.
 * @param {boolean} [options.openCDX=false] - Whether to open the Change Directory Extended (CDX) tool.
 * @param {boolean} [options.openDiskCleaner=false] - Whether to open the Disk Cleaner tool.
 * @param {boolean} [options.openDiskCleanerSageRun=false] - Whether to perform the specified Disk Cleanup configuration.
 * @param {boolean} [options.openDismAddPackages=false] - Whether to run DISM to add a package.
 * @param {boolean} [options.openDismCheckHealth=false] - Whether to run DISM for health checking.
 * @param {boolean} [options.openDismGetPackages=false] - Whether to run DISM to get a list of installed packages.
 * @param {boolean} [options.openDismRepair=false] - Whether to run DISM for repair.
 * @param {boolean} [options.openDismRestoreHealth=false] - Whether to run DISM for restoring health.
 * @param {boolean} [options.openMDT=false] - Whether to open the Memory Diagnostic Tool (MDT).
 * @param {boolean} [options.openMRT=false] - Whether to open the Malicious Software Removal Tool (MRT).
 * @param {boolean} [options.openSFC=false] - Whether to run the System File Checker (SFC) tool.
 * @param {boolean} [options.openWF=false] - Whether to open the Winsat Formal (WF) tool.
 * @param {boolean} [options.openWingetUpgrade=false] - Whether to open the wingetUpgrade tool
 * @param {boolean} [options.updateCheckWindowsUpdate=false] - Whether Windows update will check for updates.
 * @returns {Promise<void>} A Promise that resolves when the cleanup is complete.
 * @throws {Error} If an error occurs during the cleanup process.
 */
async function clear(options = {}) {
  const {
    clearSpotifyData = false,
    clearWindows10Upgrade = false,
    clearWindowsOld = false,
    clearWindowsUpdate = false,
    openCDF = false,
    openCDR = false,
    openCDX = false,
    openDiskCleaner = false,
    openDiskCleanerSageRun = false,
    openDismAddPackages = false,
    openDismCheckHealth = false,
    openDismGetPackages = false,
    openDismRepair = false,
    openDismRestoreHealth = false,
    openMDT = false,
    openMRT = false,
    openSFC = false,
    openWF = false,
    openWingetUpgrade = false,
    updateCheckWindowsUpdate = false,
  } = options;

  try {
  if (Object.keys(options).length > 20) {
    throw new OptionsError("There are too many options. Maximum 20 options can be added.");
  }
  } catch (error) {
    if (error instanceof OptionsError) {
      logError(error.message);
    } else {
      throw error;
    }
  }

  try {
  let totalFilesDeleted = 0;

  checkLatestVersion();
  const folders = await getDefaultFolders();

  if (clearWindowsOld) {
    folders.push("c:\\windows.old");
  }
  if (clearWindows10Upgrade) {
    folders.push("c:\\Windows10Upgrade");
  }

  if (clearSpotifyData) {
    try {
      const filePath = `SpotifyInfo.txt`;
      const fileContent =
        "\u0059\u006f\u0075\u0020\u0063\u0061\u006e\u0020\u0065\u006e\u0074\u0065\u0072\u0020\u0074\u0068\u0065\u0020\u0053\u0070\u006f\u0074\u0069\u0066\u0079\u0020\u0061\u0070\u0070\u006c\u0069\u0063\u0061\u0074\u0069\u006f\u006e\u002c\u0020\u0067\u006f\u0020\u0074\u006f\u0020\u0074\u0068\u0065\u0020\u0022\u0053\u0065\u0074\u0074\u0069\u006e\u0067\u0073\u0022\u0020\u0073\u0065\u0063\u0074\u0069\u006f\u006e\u0020\u0061\u006e\u0064\u0020\u0063\u006c\u0065\u0061\u0072\u0020\u0069\u0074\u0020\u0066\u0072\u006f\u006d\u0020\u0074\u0068\u0065\u0020\u0022\u0043\u006c\u0065\u0061\u0072\u0020\u0043\u0061\u0063\u0068\u0065\u0022\u0020\u006f\u0070\u0074\u0069\u006f\u006e\u002c\u0020\u0079\u006f\u0075\u0020\u0063\u0061\u006e\u0020\u0061\u006c\u0073\u006f\u0020\u0064\u0065\u006c\u0065\u0074\u0065\u0020\u0022\u0044\u006f\u0077\u006e\u006c\u006f\u0061\u0064\u0073\u0022\u0020\u0066\u0072\u006f\u006d\u0020\u0074\u0068\u0065\u0020\u0073\u0061\u006d\u0065\u0020\u0073\u0065\u0063\u0074\u0069\u006f\u006e\u002e";
      fs.promises.writeFile(filePath, fileContent, "utf8");
      console.log(`File created and content written: \x1b[32m${filePath}\x1b[0m`);
    } catch (error) {
      logError("An error occurred:", error);
    }
  }

  try {
    if (clearWindowsUpdate) await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'dism /online /cleanup-image /startcomponentcleanup' -Wait }\"", "Windows Update");
    if (openCDF) await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'chkdsk /f' -Wait }\"", "Check Disk");
    if (openCDR) await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'chkdsk /r' -Wait }\"", "Check Disk");
    if (openCDX) await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'chkdsk /x' -Wait }\"", "Check Disk");
    if (openDismAddPackages) await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'dism /online /add-package /packagepath:C:\\path\\to\\update.cab' -Wait }\"", "DISM Add Packages");
    if (openDismCheckHealth) await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'dism /online /cleanup-image /checkhealth' -Wait }\"", "DISM Check Health");
    if (openDismGetPackages) await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'dism /online /get-packages' -Wait }\"", "DISM Get Packages");
    if (openDismRepair) await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'dism /online /cleanup-image /restorehealth /source:C:\\path\\to\\source /limitaccess' -Wait }\"", "DISM Repair"), await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'dism /online /cleanup-image /restorehealth /source:C:\\path\\to\\repairsource\\install.wim' -Wait }\"", "DISM Repair 2");
    if (openDismRestoreHealth) await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'dism /online /cleanup-image /restorehealth' -Wait }\"", "DISM Restore Health");
    if (openDiskCleaner) await openTool("cleanmgr.exe", "Disk Cleaner");
    if (openDiskCleanerSageRun) await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'cleanmgr /sagerun:1' -Wait }\"", "Disk Cleaner Sagerun");
    if (openMDT) await openTool("powershell -Command \"Start-Process 'mdsched.exe' -Verb RunAs -Wait\"", "MDT");
    if (openMRT) await openTool("mrt.exe", "MRT");
    if (openSFC) await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'sfc /scannow' -Wait }\"", "Scan");
    if (openWF) await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'winsat formal' -Wait }\"", "winsat formal");
    if (openWingetUpgrade) await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'winget upgrade -all' -Wait }\"", "Upgrade winget");
    if (updateCheckWindowsUpdate) await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'wuauclt.exe /detectnow' -Wait }\"", "Check Win Update");
  } catch (error) {
    logError("Error while opening tools:", error);
  }

  for (const folder of folders) {
    try {
      const files = await listFilesInFolder(folder);
      if (files.length > 0) {
        console.log(`Deleting files in ${folder}:`);
        for (const file of files) {
          const filePath = `${folder}\\${file}`;
          await deleteFile(filePath);
          totalFilesDeleted++;
        }
      } else {
        console.log(`There are no files in \x1b[31m${folder}\x1b[0m to delete.`);
      }
    } catch (error) {
      logError(`Error processing the ${folder} folder:`, error);
    }
  }
  console.log(`${totalFilesDeleted > 0 ? '\x1b[32m' : '\x1b[31m'}${totalFilesDeleted}\x1b[0m files detected, ${successfulDeletions > 0 ? '\x1b[32m' : '\x1b[31m'}${successfulDeletions}\x1b[0m files deleted.`);
  } catch (error) {
    logError("Error during cleaning:", error);
  }
}

module.exports = { clear };
