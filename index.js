/**
 * @author Sasprosko
 * @description I coded it to bring the computer back to fast performance, pure, tidy, like when you first bought it. I have absolutely no bad intentions and there is no bad software in the code.
 * @version 0.0.6
 * @copyright (c) 2023 Sasprosko/Umut
 * @license MIT
 * @file LICENSE
 */

const https = require("https");
const fs = require("fs");
const { exec } = require("child_process");
const UserAgent = require("user-agents");

const nodeVersion = Number(process.versions.node.split(".")[0]);
if (nodeVersion < 10) {
  throw new Error(`Your Node.js version ${process.version} is too old. Please update it: https://nodejs.org/en`);
}

async function RandomUserAgent() {
  const userAgent = new UserAgent();
  return userAgent.toString();
}

/**
 * Checks the latest version of a GitHub repository.
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
          const str = String("\u0056\u0030\u002e\u0030\u002e\u0036");
          
          if (latestVersion !== str) {
            console.log("The project is out of date.");
            console.log("https://github.com/sasprosko590/SASPClean")
          } else {
            console.log("The project is up to date.");
          }
        } catch (error) {
          console.error("GitHub API Error:", error.message);
        }
      });
    })
    .on("error", (error) => {
      console.error("HTTP GET error:", error.message);
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
}

/**
 * Executes a command and returns the result.
 *
 * @param {string} command - The command to be executed.
 * @param {Object} [options={}] - Execution options.
 * @returns {Promise<Object>} - A promise that resolves with the command execution result.
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
    console.error("Command error:", error.message);
    throw error;
  }
}

/**
 * Retrieves the default folders based on the current user.
 *
 * @returns {Promise<string[]>} - A promise that resolves with an array of default folders.
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
    const whoamiResult = await execCommand("whoami");
    let username, extractedPart;

    if (whoamiResult && whoamiResult.stdout) {
      username = whoamiResult.stdout.toString().trim();
    } else {
      const echoResult = await execCommand("echo %username%");

      if (echoResult && echoResult.stdout) {
        username = echoResult.stdout.toString().trim();
      } else {
        console.error("Error: The echo command to get the username failed.");
        return null;
      }
    }

    const index = username.indexOf("\\");
    extractedPart = index !== -1 ? username.substring(index + 1) : username;
    //console.log("Username:", extractedPart);
    return extractedPart;
  } catch (error) {
    console.error("Error retrieving username:", error.message);
    return null;
  }
}

/**
 * Checks if a folder exists.
 *
 * @param {string} folderPath - The path of the folder.
 * @returns {Promise<boolean>} - A promise that resolves with true if the folder exists, false otherwise.
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
 * @param {string} folderPath - The path of the folder.
 * @returns {Promise<string[]>} - A promise that resolves with files in the folder.
 */
async function listFilesInFolder(folderPath) {
  try {
    const folderExists = await FolderExists(folderPath);
    if (!folderExists) {
      console.log(`Folder does not exist: ${folderPath}`);
      return [];
    }

    const files = await fs.promises.readdir(folderPath);
    console.log(`\nFiles in ${folderPath}:`);
    return files.map(file => `${folderPath}\\${file}`);
  } catch (error) {
    console.error(`Error listing files in ${folderPath}:`, error.message);
    return [];
  }
}

/**
 * Deletes a file asynchronously.
 *
 * @param {string} filePath - The path of the file.
 * @returns {Promise<void>} - A promise that resolves after the file is deleted.
 */
async function deleteFile(filePath) {
  try {
    const fileExists = await FolderExists(filePath);
    if (fileExists) {
      console.log(`Deleting file: ${filePath}`);
      await fs.promises.unlink(filePath);
      console.log(`File deleted successfully: ${filePath}`);
    } else {
      console.log(`File does not exist: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error deleting file asynchronously: ${error.message}`);
  }
}

/**
 * Opens a tool using the specified command.
 *
 * @param {string} toolCommand - The command to open the tool.
 * @param {string} toolDisplayName - The display name of the tool for logging purposes.
 */
async function openTool(toolCommand, toolDisplayName) {
  try {
    const terminalCommand = process.platform === "win32" ? `start cmd /c ${toolCommand}` : toolCommand;
    await new Promise((resolve, reject) => {
      execCommand(terminalCommand)
        .then(() => {
          console.log(`${toolDisplayName} opened successfully.`);
          resolve();
        })
        .catch(error => {
          console.error(`Error opening ${toolDisplayName}:`, error.message);
          reject(error);
        });
    });
  } catch (error) {
    console.error(`Error opening ${toolDisplayName}:`, error.message);
  }
}

/**
 * Clears specified folders, opens selected tools, and performs additional cleanup actions.
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
 */
async function clear({
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
} = {}) {
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
      const filePath = `${__dirname}/SpotifyInfo.txt`;
      const fileContent =
        "\u0059\u006f\u0075\u0020\u0063\u0061\u006e\u0020\u0065\u006e\u0074\u0065\u0072\u0020\u0074\u0068\u0065\u0020\u0053\u0070\u006f\u0074\u0069\u0066\u0079\u0020\u0061\u0070\u0070\u006c\u0069\u0063\u0061\u0074\u0069\u006f\u006e\u002c\u0020\u0067\u006f\u0020\u0074\u006f\u0020\u0074\u0068\u0065\u0020\u0022\u0053\u0065\u0074\u0074\u0069\u006e\u0067\u0073\u0022\u0020\u0073\u0065\u0063\u0074\u0069\u006f\u006e\u0020\u0061\u006e\u0064\u0020\u0063\u006c\u0065\u0061\u0072\u0020\u0069\u0074\u0020\u0066\u0072\u006f\u006d\u0020\u0074\u0068\u0065\u0020\u0022\u0043\u006c\u0065\u0061\u0072\u0020\u0043\u0061\u0063\u0068\u0065\u0022\u0020\u006f\u0070\u0074\u0069\u006f\u006e\u002c\u0020\u0079\u006f\u0075\u0020\u0063\u0061\u006e\u0020\u0061\u006c\u0073\u006f\u0020\u0064\u0065\u006c\u0065\u0074\u0065\u0020\u0022\u0044\u006f\u0077\u006e\u006c\u006f\u0061\u0064\u0073\u0022\u0020\u0066\u0072\u006f\u006d\u0020\u0074\u0068\u0065\u0020\u0073\u0061\u006d\u0065\u0020\u0073\u0065\u0063\u0074\u0069\u006f\u006e\u002e";

      fs.promises.writeFile(filePath, fileContent, "utf8");
      console.log(`File created and content written: ${filePath}`);
    } catch (error) {
      console.error("An error occurred:", error.message);
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
    console.error("Error while opening tools:", error.message);
  }

  for (const folder of folders) {
    try {
      const files = await listFilesInFolder(folder);
      if (files.length > 0) {
        console.log(`Deleting files in ${folder}:`);
        for (const file of files) {
          const filePath = `${folder}\\${file}`;
          await deleteFile(filePath);
          console.log(`File deleted successfully: ${filePath}`);
        }
      } else {
        console.log(`No files to delete in ${folder}.`);
      }
    } catch (error) {
      console.error(`Error processing folder ${folder}:`, error.message);
    }
  }
}

module.exports = { clear, };