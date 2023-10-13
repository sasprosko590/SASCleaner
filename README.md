# System Cleanup and Optimization Script 🚀

## Overview 🌐

This script was created to restore the computer to the fast, pure and tidy performance it had when it was first purchased.

- **Version:** 0.0.1
- **License:** MIT
- **Copyright:** (c) 2023 Sasprosko/Hope

### System Cleaning 🚮

The `clear` function manages the general cleaning process. It takes default folders, opens selected tools and deletes files in specified folders.

#### Options for `clear` Function

- `openDiskCleaner`: Opens the Disk Cleanup tool.
- `openMRT`: Opens the Malware Removal Tool.
- `openSFC`: Runs the System File Checker (SFC) tool.
- `openDismRepair`: Runs the Deployment Image Service and Management Tool (DISM) for repair.
- `openDismGetPackages`: Runs DISM to get a list of installed packages.
- `openDismAddPackages`: Runs DISM to add packages.

#### Note: I recommend to always set "Dism" to "true"

## Usage 🚀

To use the code, you can call the `clear` function with the options you want, or if you don't know anything you can look in the `index.test.js` file.

