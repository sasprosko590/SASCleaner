const cleaner = require("./index.js");

try {
  cleaner.clear({
    openDiskCleaner: true,
    openMRT: false,
    openSFC: false,
    openDism: false,
  });
} catch (error) {
  console.error("An error occurred:", error.message);
}
