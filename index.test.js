const cleaner = require("./index.js");
async function runExample() {
  try {
    console.log("Running SASPClean script...");

    const options = {
      clearSpotifyData: true,
      clearWindows10Upgrade: true,
      clearWindowsOld: true,
      clearWindowsUpdate: true,
      openCDF: true,
      openCDR: true,
      openCDX: true,
      openDiskCleaner: true,
      openDiskCleanerSageRun: true,
      openDismAddPackages: true,
      openDismCheckHealth: true,
      openDismGetPackages: true,
      openDismRepair: true,
      openDismRestoreHealth: true,
      openMDT: true,
      openMRT: true,
      openSFC: true,
      openWF: true,
      openWingetUpgrade: true,
      updateCheckWindowsUpdate: true,
    };
    
    cleaner.clear(options);
    console.log("SASPClean completed successfully!");
  } catch (error) {
    console.error("Error during SASPClean:", error.message);
  }
}

runExample();