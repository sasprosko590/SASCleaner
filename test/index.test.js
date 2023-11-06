const cleaner = require("../src/index.js");
const logError = require("../errors/error.js").logError;
const fs = require("fs");
async function runExample() {
  try {
    const options = {
      clearSpotifyData: false,
      clearWindows10Upgrade: false,
      clearWindowsOld: false,
      clearWindowsUpdate: false,
      openCDF: false,
      openCDR: false,
      openCDX: false,
      openDiskCleaner: false,
      openDiskCleanerSageRun: false,
      openDismAddPackages: false,
      openDismCheckHealth: false,
      openDismGetPackages: false,
      openDismRepair: false,
      openDismRestoreHealth: false,
      openMDT: false,
      openMRT: false,
      openSFC: false,
      openWF: false,
      openWingetUpgrade: false,
      updateCheckWindowsUpdate: false,
    };

    cleaner.clear(options);
  } catch (error) {
    logError("Error during SASPClean:", error);
  }
}

runExample();
