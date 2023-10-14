/**
 * @author Sasprosko
 * @description I coded it to bring the computer back to fast performance, pure, tidy, like when you first bought it. I have absolutely no bad intentions and there is no bad software in the code.
 * @version 0.0.2
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
 * Checks if a folder exists.
 *
 * @param {string} folderPath - The path of the folder.
 * @returns {Promise<boolean>} - A promise that resolves with true if the folder exists, false otherwise.
 */
const FolderExists = async (folderPath) => {
  try {
    await fs.promises.access(folderPath, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Lists files in a given folder.
 *
 * @param {string} folderPath - The path of the folder.
 * @returns {Promise<string[]>} - A promise that resolves with files in the folder.
 */
const listFilesInFolder = async (folderPath) => {
  try {
    // Check if the folder exists
    const folderExists = await FolderExists(folderPath);
    if (!folderExists) {
      console.log(`Folder does not exist: ${folderPath}`);
      return [];
    }

    const stats = await fs.promises.stat(folderPath);
    if (!stats.isDirectory()) return [];

    console.log(`\nFiles in ${folderPath}:`);
    const files = await fs.promises.readdir(folderPath);
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
 * @returns {Promise<void>} - A promise that resolves after the file is deleted.
 */
const deleteFile = async (filePath) => {
  try {
    console.log(`Deleting file: ${filePath}`);
    // Check for files
    const fileExists = await FolderExists(filePath);
    if (!fileExists) {
      console.log(`File does not exist: ${filePath}`);
      return;
    }
    // Delete file
    await fs.promises.unlink(filePath);
    console.log(`File deleted successfully: ${filePath}`);
  } catch (error) {
    console.error(`Error deleting file asynchronously: ${error.message}`);
    try {
      // Try to delete synchronously too
      console.log(`Attempting to delete file synchronously: ${filePath}`);
      fs.unlinkSync(filePath);
      console.log(`File deleted successfully (synchronously): ${filePath}`);
    } catch (syncError) {
      console.error(`Error deleting file synchronously: ${syncError.message}`);
    }
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
 * @param {boolean} [options.clearSpotifyData=false] - Whether to clear Spotify data.
 * @param {boolean} [options.clearWindows10Upgrade=false] - Whether to clear the Windows10Upgrade folder.
 * @param {boolean} [options.clearWindowsOld=false] - Whether to clear the Windows.old folder.
 * @param {boolean} [options.openDiskCleaner=false] - Whether to open the Disk Cleaner tool.
 * @param {boolean} [options.openDismAddPackages=false] - Whether to run DISM to add a package.
 * @param {boolean} [options.openDismCheckHealth=false] - Whether to run DISM for health checking.
 * @param {boolean} [options.openDismGetPackages=false] - Whether to run DISM to get a list of installed packages.
 * @param {boolean} [options.openDismRepair=false] - Whether to run DISM for repair.
 * @param {boolean} [options.openDismRestoreHealth=false] - Whether to run DISM for restoring health.
 * @param {boolean} [options.openMDT=false] - Whether to open the Memory Diagnostic Tool (MDT).
 * @param {boolean} [options.openMRT=false] - Whether to open the Malicious Software Removal Tool (MRT).
 * @param {boolean} [options.openSFC=false] - Whether to run the System File Checker (SFC) tool.
 */
async function clear({
  clearSpotifyData = false,
  clearWindows10Upgrade = false,
  clearWindowsOld = false,
  openDiskCleaner = false,
  openDismAddPackages = false,
  openDismCheckHealth = false,
  openDismGetPackages = false,
  openDismRepair = false,
  openDismRestoreHealth = false,
  openMDT = false,
  openMRT = false,
  openSFC = false,
} = {}) {
  // Retrieve default folders
  let folders = await defaultFolders();

  // Optionally add additional folders based on user's choices
  if (clearWindowsOld) {
    folders.push("c:\\windows.old");
  }
  if (clearWindows10Upgrade) {
    folders.push("c:\\Windows10Upgrade");
  }

  if (clearSpotifyData) {
    try {
      if (clearSpotifyData) {
        let filePath = `${__dirname}/SpotifyInfo.txt`;
        let fileContent =
          "\u0059\u006f\u0075\u0020\u0063\u0061\u006e\u0020\u0065\u006e\u0074\u0065\u0072\u0020\u0074\u0068\u0065\u0020\u0053\u0070\u006f\u0074\u0069\u0066\u0079\u0020\u0061\u0070\u0070\u006c\u0069\u0063\u0061\u0074\u0069\u006f\u006e\u002c\u0020\u0067\u006f\u0020\u0074\u006f\u0020\u0074\u0068\u0065\u0020\u0022\u0053\u0065\u0074\u0074\u0069\u006e\u0067\u0073\u0022\u0020\u0073\u0065\u0063\u0074\u0069\u006f\u006e\u0020\u0061\u006e\u0064\u0020\u0063\u006c\u0065\u0061\u0072\u0020\u0069\u0074\u0020\u0066\u0072\u006f\u006d\u0020\u0074\u0068\u0065\u0020\u0022\u0043\u006c\u0065\u0061\u0072\u0020\u0043\u0061\u0063\u0068\u0065\u0022\u0020\u006f\u0070\u0074\u0069\u006f\u006e\u002c\u0020\u0079\u006f\u0075\u0020\u0063\u0061\u006e\u0020\u0061\u006c\u0073\u006f\u0020\u0064\u0065\u006c\u0065\u0074\u0065\u0020\u0022\u0044\u006f\u0077\u006e\u006c\u006f\u0061\u0064\u0073\u0022\u0020\u0066\u0072\u006f\u006d\u0020\u0074\u0068\u0065\u0020\u0073\u0061\u006d\u0065\u0020\u0073\u0065\u0063\u0074\u0069\u006f\u006e\u002e";

        fs.stat(filePath, (err, stats) => {
          if (err) {
            if (err.code === "ENOENT") {
              // If the file does not exist, create it and write the content
              fs.writeFile(filePath, fileContent, "utf8", (writeErr) => {
                if (writeErr) {
                  console.error("File creation and writing error:", writeErr);
                } else {
                  console.log(`File created and content written: ${filePath}`);
                }
              });
            } else {
              console.error("File status check error:", err);
            }
          } else {
            // If the file already exists, update the content
            fs.writeFile(filePath, fileContent, "utf8", (writeErr) => {
              if (writeErr) {
                console.error("File content update error:", writeErr);
              } else {
                console.log(`Updated file content: ${filePath}`);
              }
            });
          }
        });
      }
    } catch (error) {
      console.error("An error occurred:", error.message);
    }
  }

  // Open selected tools
  try {
    if (openDismAddPackages)
      await openTool(
        "powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'dism /online /add-package /packagepath:C:\\path\\to\\update.cab' -Wait }\"",
        "DISM Add Packages"
      );
    if (openDismCheckHealth)
      await openTool(
        "powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'dism /online /cleanup-image /checkhealth' -Wait }\"",
        "DISM Check Health"
      );
    if (openDismGetPackages)
      await openTool(
        "powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'dism /online /get-packages' -Wait }\"",
        "DISM Get Packages"
      );
    if (openDismRepair)
      await openTool(
        "powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'dism /online /cleanup-image /restorehealth /source:C:\\path\\to\\repairsource\\install.wim' -Wait }\"",
        "DISM Repair"
      );
    if (openDismRestoreHealth)
      await openTool(
        "powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'dism /online /cleanup-image /restorehealth' -Wait }\"",
        "DISM Restore Health"
      );
    if (openDiskCleaner) await openTool("cleanmgr.exe", "Disk Cleaner");
    if (openMDT)
      await openTool(
        "powershell -Command \"Start-Process 'mdsched.exe' -Verb RunAs -Wait\"",
        "MDT"
      );
    if (openMRT) await openTool("mrt.exe", "MRT");
    if (openSFC)
      await openTool(
        "powershell -Command \"& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', 'sfc /scannow' -Wait }\"",
        "'sfc /scannow'"
      );
  } catch (error) {
    console.error("Error while opening tools:", error.message);
  }

  // Retrieve files in default folders and delete them
  for (const folder of folders) {
    try {
      const files = await listFilesInFolder(folder);
      if (files.length > 0) {
        console.log(`Deleting files in ${folder}:`);
        for (const file of files) {
          const filePath = `${folder}\\${file}`;
          await deleteFile(filePath);
        }
      } else {
        console.log(`No files to delete in ${folder}.`);
      }
    } catch (error) {
      console.error(`Error processing folder ${folder}:`, error.message);
    }
  }
}

module.exports = {
  clear,
};
