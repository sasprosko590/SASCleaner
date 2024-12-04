const cleaner = require("../src/index.js");
const logError = require("../errors/error.js").logError;
async function runExample() {
  try {
    const options = {
      clearSpotifyData: false,
      clearWindows10Upgrade: false,
      clearWindowsOld: false,
      clearWindowsUpdate: false,
      hackCheck: false,
      checkDisk: false,
      openDiskCleaner: false,
      openDiskCleanerSageRun: false,
      openDismTools: false,
      openMDT: false,
      openMRT: false,
      openSFC: false,
      openWF: false,
      openUpgrade: false,
      updateCheckWindowsUpdate: false,
    };

    cleaner.clear(options);
  } catch (error) {
    logError("Error during SASPClean:", error);
  }
}
runExample();
