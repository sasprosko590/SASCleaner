/**
 * Options for controlling the clearing and tool opening process.
 */
interface SASPClean {
  clearSpotifyData?: boolean;
  clearWindows10Upgrade?: boolean;
  clearWindowsOld?: boolean;
  clearWindowsUpdate?: boolean;
  openCDF?: boolean;
  openCDR?: boolean;
  openCDX?: boolean;
  openDiskCleaner?: boolean;
  openDiskCleanerSageRun?: boolean;
  openDismAddPackages?: boolean;
  openDismCheckHealth?: boolean;
  openDismGetPackages?: boolean;
  openDismRepair?: boolean;
  openDismRestoreHealth?: boolean;
  openMDT?: boolean;
  openMRT?: boolean;
  openSFC?: boolean;
  openWF?: boolean;
  openWingetUpgrade?: boolean;
  updateCheckWindowsUpdate?: boolean;
}

/**
 * Clears specified folders, opens selected tools, and performs additional cleanup actions.
 * @param {SASPClean} [options={}] - Options for controlling the clearing and tool opening process.
 * @param {SASPClean} [options.clearSpotifyData=false] - Whether to clear Spotify data.
 * @param {SASPClean} [options.clearWindows10Upgrade=false] - Whether to clear the Windows10Upgrade folder.
 * @param {SASPClean} [options.clearWindowsOld=false] - Whether to clear the Windows.old folder.
 * @param {SASPClean} [options.clearWindowsUpdate=false] - Whether Windows Update will be cleaned.
 * @param {SASPClean} [options.openCDF=false] - Whether to open the Change Directory Fast (CDF) tool.
 * @param {SASPClean} [options.openCDR=false] - Whether to open the Change Directory Recursive (CDR) tool.
 * @param {SASPClean} [options.openCDX=false] - Whether to open the Change Directory Extended (CDX) tool.
 * @param {SASPClean} [options.openDiskCleaner=false] - Whether to open the Disk Cleaner tool.
 * @param {SASPClean} [options.openDiskCleanerSageRun=false] - Whether to perform the specified Disk Cleanup configuration.
 * @param {SASPClean} [options.openDismAddPackages=false] - Whether to run DISM to add a package.
 * @param {SASPClean} [options.openDismCheckHealth=false] - Whether to run DISM for health checking.
 * @param {SASPClean} [options.openDismGetPackages=false] - Whether to run DISM to get a list of installed packages.
 * @param {SASPClean} [options.openDismRepair=false] - Whether to run DISM for repair.
 * @param {SASPClean} [options.openDismRestoreHealth=false] - Whether to run DISM for restoring health.
 * @param {SASPClean} [options.openMDT=false] - Whether to open the Memory Diagnostic Tool (MDT).
 * @param {SASPClean} [options.openMRT=false] - Whether to open the Malicious Software Removal Tool (MRT).
 * @param {SASPClean} [options.openSFC=false] - Whether to run the System File Checker (SFC) tool.
 * @param {SASPClean} [options.openWF=false] - Whether to open the Winsat Formal (WF) tool.
 * @param {SASPClean} [options.openWingetUpgrade=false] - Whether to open the wingetUpgrade tool
 * @param {SASPClean} [options.updateCheckWindowsUpdate=false] - Whether Windows update will check for updates.
 */
declare function clear(options?: SASPClean): void;

export { clear };
