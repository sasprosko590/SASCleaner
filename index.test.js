const cleaner = require("./index");

async function runExample() {
  try {
    console.log("Running system cleanup and optimization script...");

    const options = {
      clearSpotifyData: true,
      clearWindows10Upgrade: true,
      clearWindowsOld: true,
      openDiskCleaner: true,
      openDismAddPackages: true,
      openDismCheckHealth: true,
      openDismGetPackages: true,
      openDismRepair: true,
      openDismRestoreHealth: true,
      openMDT: true,
      openMRT: true,
      openSFC: true,
    };

    await cleaner.clear(options);

    console.log("System cleanup and optimization completed successfully!");
  } catch (error) {
    console.error(
      "Error during system cleanup and optimization:",
      error.message
    );
  }
}

runExample();
