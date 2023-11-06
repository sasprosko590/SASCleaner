const https = require("https");
const path = require("path");
const fs = require("fs");
const UserAgent = require("user-agents");
const { promisify } = require('util');
const execAsync = promisify(require('child_process').exec);
const { exec } = require("child_process");
const version = require('../package.json').version;
const OptionsError = require("../errors/error.js").OptionsError;
const logError = require("../errors/error.js").logError;

/**
 * Retrieves language data based on the user's locale.
 *
 * @param {string} property The property to retrieve from the language data.
 * @returns {string} The value of the requested property in the user's language.
 * @since 0.0.8
 * @throws {Error} If there is an issue while getting or parsing the language data.
 */
const langData = (property) => {
  try {
    const userLocale = Intl.DateTimeFormat().resolvedOptions().locale;
    const lang = userLocale.split('-')[0].toLowerCase();

    const langFilePath = path.join(__dirname, `../language/locales/${lang}.json`);
    const fileContent = fs.readFileSync(langFilePath, 'utf8');
    const langData = JSON.parse(fileContent);

    return langData[property];
  } catch (error) {
    console.error('Error while getting locale:', error.message);
    return 'Error occurred while getting locale data.';
  }
};

/**
 * Node.js version check.
 *
 * @since 0.0.6
 * @throws {Error} Throws an error if the Node.js version is too old.
 */
const nodeVersion = Number(process.versions.node.split(".")[0]);
if (nodeVersion < 10) {
  throw new Error(langData("NodeVersion"));
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

    const response = await new Promise((resolve, reject) => {
      https.get({ hostname: "api.github.com", path: "/repos/sasprosko590/SASPClean/releases/latest", headers }, resolve)
        .on("error", reject);
    });
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        try {
          if (response.statusCode !== 200 || !response.headers["content-type"].includes("application/json")) {
            logError(langData("InvalidStatusCode") + response.statusCode);
          }

          const parsedData = JSON.parse(data);
          const latestVersion = parsedData.tag_name;

          if (latestVersion !== "V" + version.toString()) {
            console.log(langData("OutOfDate"));
            console.log(String(langData("Version")).replace("${version}", version).replace("${latestVersion}", latestVersion))
            console.log(langData("Links"))
            console.log("https://github.com/sasprosko590/SASPClean");
            console.log(parsedData.html_url);
          } else {
            console.log(langData("UptoDate"));
          }
        } catch (error) {
          logError(langData("GithubApiError"), error);
        }
      });
    } catch (error) {
    logError(langData("Error"), error);
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
    const { stdout, stderr } = await execAsync(command, { ...options, cwd: __dirname });
    return { stdout, stderr };
  } catch (error) {
    logError(langData("CommandError"), error);
    return { error };
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
        langData("MissingUsername")
      );
      return [];
    }
  } catch (error) {
    logError(langData("ErrorFolder"), error);
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
    const whoamiResult = await execCommand("whoami") || await execCommand("echo %username%");
    let username, extractedPart;

    if (whoamiResult && whoamiResult.stdout) {
      username = whoamiResult.stdout.toString().trim();
      const index = username.indexOf("\\");
      extractedPart = index !== -1 ? username.substring(index + 1) : username;
      return extractedPart;
    } else {
      throw new Error(langData("ErrorUsername"));
    }
  } catch (error) {
    logError(langData("ErrorUsernameSimple"), error);
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
      console.log(String(langData("FolderDoesNotExist")).replace("${folderPath}", folderPath))
      return [];
    }

    const files = await fs.promises.readdir(folderPath);
    console.log(String(langData("FilesIn")).replace("${folderPath}", folderPath));
    return files.map(file => file);
  } catch (error) {
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
      console.log(String(langData("FilesDeletedSuccesfully")).replace("${filePath}", filePath));
    } else {
      console.log(String(langData("FileDoesNotExist").replace("${filePath}", filePath)));
    }
  } catch (error) {
    return;
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
          console.log(String(langData("OpenedSuccessfully")).replace("${toolDisplayName}", toolDisplayName));
          resolve();
        })
        .catch(error => {
          logError(String(langData("ErrorOpening")).replace("${toolDisplayName}", toolDisplayName), error);
          reject(error);
        });
    });
  } catch (error) {
    logError(String(langData("ErrorOpening")).replace("${toolDisplayName}", toolDisplayName), error);
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
 * @param {boolean} [options.hackCheck] - Whether to check if you've been hacked
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
    hackCheck = false,
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

  if (Object.keys(options).length > 20) {
    throw new OptionsError(langData("NodeVersion")).toString();
  }
  
  checkLatestVersion();
  let totalFilesDeleted = 0;

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
      const fileContent = langData("SpotifyInformation").toString();
      fs.promises.writeFile(filePath, fileContent, "utf8");
      console.log(String(langData("FileCreatedAndContentWritten")).replace("${filePath}", filePath));
    } catch (error) {
      logError(langData("AnErrorOccurred"), error);
    }
  }

  try {
    if (clearWindowsUpdate) await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'dism /online /cleanup-image /startcomponentcleanup' -Wait }\"", "Windows Update");
    if (hackCheck) await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/k', 'quser' -Wait }\"", "Hack Check")
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
    logError(langData("ErrorWhileOpeningTools"), error);
  }

  const folderPromises = folders.map(async (folder) => {
    try {
      const files = await listFilesInFolder(folder);
      if (files.length > 0) {
        console.log(String(langData("DeletingFilesInFolder")).replace("${folder}", folder));
        await Promise.all(files.map(async (file) => {
          const filePath = `${folder}/${file}`;
          await deleteFile(filePath);
          totalFilesDeleted++;
        }));
      } else {
        console.log(String(langData("ThereAreNoFilesIn")).replace("${folder}", folder));
      }
    } catch (error) {
      logError(String(langData("ErrorHandlingFolder")).replace("${folder}", folder), error);
    }
  });

  await Promise.all(folderPromises);
  console.log(String(langData("InformationLog")).replace("${totalFilesDeleted}", totalFilesDeleted).replace("${successfulDeletions}", successfulDeletions));
}
module.exports = { clear };
