const https = require("https");
const path = require("path");
const fs = require("fs");
const UserAgent = require("user-agents");
const { promisify } = require('util');
const execAsync = promisify(require('child_process').exec);
const version = require('../package.json').version;
const OptionsError = require("../errors/error.js").OptionsError;
const logError = require("../errors/error.js").logError;

/**
 * Retrieves language data based on the user's locale.
 * This function reads a language file based on the user's system locale and retrieves a specific property.
 * 
 * @param {string} property The property to retrieve from the language data.
 * @returns {string} The value of the requested property in the user's language.
 * @since 0.0.8
 * @throws {Error} If there is an issue while getting or parsing the language data.
 * @example
 * const message = langData("greeting"); // Retrieves the "greeting" message in the current user's language.
 */
const langData = (property) => {
  try {
    const userLocale = Intl.DateTimeFormat().resolvedOptions().locale;
    const lang = userLocale?.split('-')[0]?.toLowerCase() || 'en';
    const langFilePath = path.join(__dirname, `../language/locales/${lang || 'en'}.json`);
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
 * This function checks if the Node.js version is below the required version (version 10).
 * If the version is too old, it throws an error with a message from the language data.
 * 
 * @since 0.0.6
 * @throws {Error} Throws an error if the Node.js version is too old.
 * @example
 * const nodeVersion = Number(process.versions.node.split(".")[0]);
 * if (nodeVersion < 10) {
 *   throw new Error(langData("NodeVersion"));
 * }
 */
const nodeVersion = Number(process.versions.node.split(".")[0]);
if (nodeVersion < 10) {
  throw new Error(langData("NodeVersion"));
}

/**
 * Generates a random user agent string.
 *
 * This function uses the `UserAgent` module to generate a random user agent string,
 * which can be useful for simulating different browser or device requests in web scraping or testing.
 *
 * @since 0.0.5
 * @returns {Promise<string>} A promise that resolves with a random user agent string.
 * @example
 * RandomUserAgent().then((userAgent) => {
 *   console.log(userAgent); // Logs a randomly generated user agent string.
 * });
 */
function RandomUserAgent() {
  return new UserAgent().toString();
}

/**
 * Checks the latest version of a GitHub repository.
 *
 * This function makes a request to the GitHub API to fetch the latest release version of the specified repository
 * and compares it with the current version of the software. If the version is outdated, it logs the version
 * difference and provides a link to the repository.
 *
 * @since 0.0.6
 * @throws {Error} Throws an error if there is an issue with the GitHub API or if the response is invalid.
 * @example
 * checkLatestVersion().then(() => {
 *   // The function checks the latest version and logs relevant messages.
 * });
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
          return;
        }
        const parsedData = JSON.parse(data);
        const latestVersion = parsedData.tag_name;

        if (latestVersion !== "V" + version.toString()) {
          console.log(langData("OutOfDate"));
          console.log(langData("Version")
            .replace("${version}", `\u001b[1;31m${version}\u001b[1;0m`)
            .replace("${latestVersion}", `\u001b[1;32m${latestVersion}\u001b[1;0m`)
          );
          console.log(langData("Links"));
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
 * Executes a shell command and returns the result.
 * This function runs a command asynchronously, captures the standard output and standard error, 
 * and returns the results as a promise.
 * 
 * @since 0.0.1
 * @param {string} command The command to be executed in the shell.
 * @param {Object} [options={}] Execution options, including `cwd` for setting the working directory.
 * @returns {Promise<Object>} A promise that resolves with an object containing `stdout` (standard output) 
 *                             and `stderr` (standard error), or an `error` if execution fails.
 * @throws {Error} If the command execution fails, an error is logged.
 * @example
 * const result = await execCommand("ls -la"); // Executes the `ls -la` command and returns the result.
 * console.log(result.stdout); // Logs the standard output.
 */
async function execCommand(command, options = {}) {
  try {
    const { stdout, stderr } = await execAsync(command, { ...options, cwd: options.cwd || __dirname });
    return { stdout, stderr };
  } catch (error) {
    logError(langData("CommandError"), error);
    return { error };
  }
}

/**
 * Retrieves a list of default folders based on the current user.
 * This function fetches the username and returns a list of default folder paths for system temporary files.
 * 
 * @since 0.0.1
 * @returns {Promise<string[]>} A promise that resolves with an array of default folder paths.
 * @throws {Error} If there is an issue retrieving the default folders or the username.
 * @example
 * const folders = await getDefaultFolders(); // Retrieves default folder paths.
 * console.log(folders); // Logs the array of folder paths.
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
 * Retrieves the current user's username by executing system commands.
 * It attempts to execute the `whoami` command or the `echo %username%` command, then processes the result to extract the username.
 * 
 * @since 0.0.2
 * @returns {Promise<string|null>} A promise that resolves with the extracted username as a string or `null` if an error occurs.
 * @throws {Error} Throws an error if there is an issue executing the command or extracting the username.
 * @example
 * const username = await getUsername(); // Retrieves the current username.
 * if (username) {
 *   console.log(`Current username: ${username}`);
 * } else {
 *   console.log("Unable to retrieve username.");
 * }
 */
async function getUsername() {
  try {
    const whoamiResult = await execCommand("whoami") || await execCommand("echo %username%");
    let username, extractedPart;

    if (whoamiResult && whoamiResult.stdout) {
      username = whoamiResult.stdout.toString().trim();
      const index = username.indexOf("\\");
      extractedPart = index !== -1 ? username.substring(index + 1) : username;
      
      if (!extractedPart) {
        throw new Error(langData("ErrorUsernameExtract") || "Failed to extract username.");
      }
      return extractedPart;
    } else if (whoamiResult && whoamiResult.stderr) {
      throw new Error(`Error executing 'whoami' command: ${whoamiResult.stderr}`);
    } else {
      throw new Error(langData("ErrorUsername") || "Unable to retrieve username.");
    }
  } catch (error) {
    logError(langData("ErrorUsernameSimple") || "Error occurred while retrieving username.", error);
    return null;
  }
}

/**
 * Checks if a folder exists by attempting to access the specified folder path.
 * It uses the `fs.promises.access` method to check for the existence of the folder.
 * 
 * @since 0.0.2
 * @param {string} folderPath - The path of the folder to check.
 * @returns {Promise<boolean>} A promise that resolves with `true` if the folder exists, or `false` if it doesn't.
 * @throws {Error} Throws an error if there is an issue checking the folder's existence.
 * @example
 * const exists = await FolderExists("c:\\Windows\\System32");
 * if (exists) {
 *   console.log("The folder exists.");
 * } else {
 *   console.log("The folder does not exist.");
 * }
 */
async function FolderExists(folderPath) {
  try {
    await fs.promises.access(folderPath, fs.constants.F_OK);
    return true;
  } catch (error) {
    logError(`Error checking folder existence for: ${folderPath}`, error);
    return false;
  }
}

/**
 * Lists the files in a given folder. It checks if the folder exists and, if it does, returns a list of filenames.
 * If the folder does not exist, it logs an error message and returns an empty array.
 * 
 * @since 0.0.1
 * @param {string} folderPath - The path of the folder to list files from.
 * @returns {Promise<string[]>} A promise that resolves with an array of file names in the folder.
 * @throws {Error} Throws an error if there is an issue accessing the folder or listing files.
 * @example
 * const files = await listFilesInFolder("c:\\Windows\\System32");
 * console.log(files); // Prints the list of files in the folder.
 */
async function listFilesInFolder(folderPath) {
  try {
    const folderExists = await FolderExists(folderPath);
    if (!folderExists) {
      const errorMessage = langData("FolderDoesNotExist").replace("${folderPath}", `\u001b[1;31m${folderPath}\u001b[1;0m`);
      console.log(errorMessage);
      return []; // Folder does not exist, return empty array.
    }

    const files = await fs.promises.readdir(folderPath);
    return files; // Returning the list of files directly.
  } catch (error) {
    logError(langData("ErrorListingFiles"), error); // Log the error if something goes wrong.
    return []; // Return empty array in case of error, or you can throw the error based on needs.
  }
}

let totalDetectedFiles = 0;
let successfulDeletions = 0;
let unsuccessfulDeletions = 0;

/**
 * Deletes a file asynchronously. It first checks if the file exists and then deletes it.
 * If the file does not exist, it logs a message indicating an unsuccessful deletion.
 * In case of any errors during the deletion process, the error is logged.
 * 
 * ! **Warning:** This function is not recommended for use in production environments. It may lead to unintended consequences and data loss if used incorrectly.
 * 
 * ! **Important:** Ensure that the file path is correct and the file is not critical before using this function.
 * 
 * @since 0.0.1
 * @param {string} filePath - The path of the file to be deleted.
 * @returns {Promise<void>} A promise that resolves after the file is deleted.
 * @throws {Error} Throws an error if there is an issue deleting the file.
 * @example
 * await deleteFile("c:\\path\\to\\file.txt"); // Deletes the specified file.
 */
async function deleteFile(filePath) {
  try {
    // Check if the file exists using fs.promises.access
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      await fs.promises.unlink(filePath);
      successfulDeletions++;
      console.log(String(langData("FilesDeletedSuccesfully")).replace("${filePath}", `\u001b[1;32m${filePath}\u001b[1;0m`));
    } catch (accessError) {
      // If the file doesn't exist, it's considered an unsuccessful deletion
      unsuccessfulDeletions++;
      console.log(String(langData("FileDoesNotExist")).replace("${filePath}", `\u001b[1;31m${filePath}\u001b[1;0m`));
    }
  } catch (error) {
    unsuccessfulDeletions++;
    logError(langData("ErrorDeletingFile"), error); // Log the error for troubleshooting
  }
}

/**
 * Opens a tool using the specified command.
 * This function executes a terminal command to open a tool based on the system's platform.
 * 
 * @param {string} toolCommand - The command to open the tool.
 * @param {string} toolDisplayName - The display name of the tool for logging purposes.
 * @since 0.0.1
 * @throws {Error} Throws an error if there is an issue opening the tool.
 * @example
 * await openTool("notepad", "Notepad"); // Opens Notepad on Windows.
 */
async function openTool(toolCommand, toolDisplayName) {
  try {
    let terminalCommand = toolCommand;
    
    if (process.platform === "win32") {
      terminalCommand = `start cmd /c ${toolCommand}`;
    } else if (process.platform === "linux" || process.platform === "darwin") {
      terminalCommand = `xterm -e ${toolCommand}`;
    }

    await execCommand(terminalCommand);
    console.log(String(langData("OpenedSuccessfully")).replace("${toolDisplayName}", `\u001b[1;32m${toolDisplayName}\u001b[1;0m`));
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
 * @param {boolean} [options.checkDisk=false] - Whether Disk Controls will work
 * @param {boolean} [options.openDiskCleaner=false] - Whether to open the Disk Cleaner tool.
 * @param {boolean} [options.openDiskCleanerSageRun=false] - Whether to perform the specified Disk Cleanup configuration.
 * @param {boolean} [options.dismTools=false] - Whether it can repair missing and corrupt files. Whether it can upload missing files.
 * @param {boolean} [options.openMDT=false] - Whether to open the Memory Diagnostic Tool (MDT).
 * @param {boolean} [options.openMRT=false] - Whether to open the Malicious Software Removal Tool (MRT).
 * @param {boolean} [options.openSFC=false] - Whether to run the System File Checker (SFC) tool.
 * @param {boolean} [options.openWF=false] - Whether to open the Winsat Formal (WF) tool.
 * @param {boolean} [options.openUpgrade=false] - Whether to open the winget and choco Upgrade tool
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
    checkDisk = false, 
    openDiskCleaner = false,
    openDiskCleanerSageRun = false,
    openDismTools = false, 
    openMDT = false,
    openMRT = false,
    openSFC = false,
    openWF = false,
    openUpgrade = false,
    updateCheckWindowsUpdate = false,
  } = options;

  if (Object.keys(options).length > 21) {
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
      await fs.promises.writeFile(filePath, fileContent, "utf8");
      console.log(String(langData("FileCreatedAndContentWritten")).replace("${filePath}", `\u001b[1;32m${filePath}\u001b[1;0m`));
    } catch (error) {
      logError(langData("AnErrorOccurred"), error);
    }
  }

  try {
    if (clearWindowsUpdate) await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'dism /online /cleanup-image /startcomponentcleanup' -Wait }\"", "Clear Windows Update"), await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'dism /online /cleanup-image /spsuperseded' -Wait }\"", "Clear Windows Update 2");
    if (hackCheck) await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/k', 'quser' -Wait }\"", "Hack Check")
    if (checkDisk) {
      await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'chkdsk /f' -Wait }\"", "Check Disk");
      await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'chkdsk /r' -Wait }\"", "Check Disk");
      await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'chkdsk /x' -Wait }\"", "Check Disk");
    }    
    if (openDismTools) {
      await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'dism /online /add-package /packagepath:C:\\path\\to\\update.cab' -Wait }\"", "DISM Add Packages");
      await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'dism /online /cleanup-image /checkhealth' -Wait }\"", "DISM Check Health");
      await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'dism /online /get-packages' -Wait }\"", "DISM Get Packages");
      await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'dism /online /cleanup-image /restorehealth /source:C:\\path\\to\\source /limitaccess' -Wait }\"", "DISM Repair");
      await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'dism /online /cleanup-image /restorehealth /source:C:\\path\\to\\repairsource\\install.wim' -Wait }\"", "DISM Repair 2");
      await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'dism /online /cleanup-image /restorehealth /source:C:\\RepairSource\\Windows /limitaccess' -Wait }\"", "DISM Repair 3");
      await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'dism /online /cleanup-image /restorehealth' -Wait }\"", "DISM Restore Health");
    }
    if (openDiskCleaner) await openTool("cleanmgr.exe", "Disk Cleaner");
    if (openDiskCleanerSageRun) await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'cleanmgr /sagerun:1' -Wait }\"", "Disk Cleaner Sagerun");
    if (openMDT) await openTool("powershell -Command \"Start-Process 'mdsched.exe' -Verb RunAs -Wait\"", "MDT");
    if (openMRT) await openTool("mrt.exe", "MRT");
    if (openSFC) await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'sfc /scannow' -Wait }\"", "Scan");
    if (openWF) await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'winsat formal' -Wait }\"", "winsat formal");
    if (openUpgrade) {
      await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'winget upgrade --all' -Wait }\"", "Upgrade winget");
      await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'choco upgrade all' -Wait }\"", "Upgrade choco");
    }
    if (updateCheckWindowsUpdate) await openTool("powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'wuauclt.exe /detectnow' -Wait }\"", "Check Win Update");
  } catch (error) {
    logError(langData("ErrorWhileOpeningTools"), error);
  }

  const folderPromises = folders.map(async (folder) => {
    try {
      const files = await listFilesInFolder(folder);
      totalDetectedFiles += files.length
      if (files.length > 0) {
        console.log(String(langData("DeletingFilesInFolder")).replace("${folder}", `\u001b[1;34m${folder}\u001b[1;0m`));
        await Promise.all(files.map(async (file) => {
          const filePath = `${folder}\\${file}`;
          await deleteFile(filePath);
          totalFilesDeleted++;
        }));
      } else {
        unsuccessfulDeletions++
        console.log(String(langData("ThereAreNoFilesIn")).replace("${folder}", `\u001b[1;31m${folder}\u001b[1;0m`));
      }
    } catch (error) {
      logError(String(langData("ErrorHandlingFolder")).replace("${folder}", `\u001b[1;31m${folder}\u001b[1;0m`), error);
    }
  });
  await Promise.all(folderPromises);
  
  console.log(
    String(langData("InformationLog"))
      .replace("${files}", folders.length == 0 ? `\u001b[1;31m${folders.length.toString()}\u001b[1;0m` : `\u001b[1;33m${folders.length.toString()}\u001b[1;0m`)
      .replace("${totalFilesDeleted}", totalFilesDeleted == 0 ? `\u001b[1;31m${totalFilesDeleted}\u001b[1;0m` : `\u001b[1;32m${totalFilesDeleted}\u001b[1;0m`)
      .replace("${successfulDeletions}", successfulDeletions == 0 ? `\u001b[1;31m${successfulDeletions}\u001b[1;0m` : `\u001b[1;32m${successfulDeletions}\u001b[1;0m`)
      .replace("${unsuccessfulDeletions}", unsuccessfulDeletions == 0 ? `\u001b[1;32m${unsuccessfulDeletions}\u001b[1;0m` : `\u001b[1;31m${unsuccessfulDeletions}\u001b[1;0m`
    )
  );
}
module.exports = { clear };
