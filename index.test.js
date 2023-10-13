const cleaner = require("./index");

async function runExample() {
  try {
    console.log("Running system cleanup and optimization script...");

    const options = {
      openDiskCleaner: true,
      openMRT: true,
      openSFC: true,
      openDismRepair: true,
      openDismGetPackages: true,
      openDismAddPackages: true,
    };
    await cleaner.clear(options);

    console.log("System cleanup and optimization completed successfully!");
  } catch (error) {
    console.error("Error during system cleanup and optimization:", error.message);
  }
}

runExample();
