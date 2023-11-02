/**
 * Clears specified folders, opens selected tools, and performs additional cleanup actions.
 * @param {boolean} [options.clearSpotifyData=false] - Whether to clear Spotify data.
 * @param {boolean} [options.clearWindows10Upgrade=false] - Whether to clear the Windows10Upgrade folder.
 * @param {boolean} [options.clearWindowsOld=false] - Whether to clear the Windows.old folder.
 * @param {boolean} [options.clearWindowsUpdate=false] - Whether Windows Update will be cleaned.
 * @param {boolean} [options.openCDF=false] - Whether to open the Change Directory Fast (CDF) tool.
 * @param {boolean} [options.openCDR=false] - Whether to open the Change Directory Recursive (CDR) tool.
 * @param {boolean} [options.openCDX=false] - Whether to open the Change Directory Extended (CDX) tool.
 * @param {boolean} [options.openDiskCleaner=false] - Whether to open the Disk Cleaner tool.
 * @param {boolean} [options.openDiskCleanerSageRun=false] - Whether to perform the specified Disk Cleanup configuration.
 * @param {boolean} [options.openDismAddPackages=false] - Whether to run DISM to add a package.
 * @param {boolean} [options.openDismCheckHealth=false] - Whether to run DISM for health checking.
 * @param {boolean} [options.openDismGetPackages=false] - Whether to run DISM to get a list of installed packages.
 * @param {boolean} [options.openDismRepair=false] - Whether to run DISM for repair.
 * @param {boolean} [options.openDismRestoreHealth=false] - Whether to run DISM for restoring health.
 * @param {boolean} [options.openMDT=false] - Whether to open the Memory Diagnostic Tool (MDT).
 * @param {boolean} [options.openMRT=false] - Whether to open the Malicious Software Removal Tool (MRT).
 * @param {boolean} [options.openSFC=false] - Whether to run the System File Checker (SFC) tool.
 * @param {boolean} [options.openWF=false] - Whether to open the Winsat Formal (WF) tool.
 * @param {boolean} [options.openWingetUpgrade=false] - Whether to open the wingetUpgrade tool
 * @param {boolean} [options.updateCheckWindowsUpdate=false] - Whether Windows update will check for updates.
 * @returns {Promise<void>} A Promise that resolves once the cleanup process is complete.
 */
declare function clear(options?: {
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
}): Promise<void>;

export { clear };
