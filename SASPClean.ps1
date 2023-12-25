Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$scriptPath = $MyInvocation.MyCommand.Path
$scriptDirectory = Split-Path $scriptPath -Parent

$packageJsonPath = Join-Path $scriptDirectory "package.json"
$packageJsonExists = Test-Path $packageJsonPath

$iconFileName = "icon\SASPClean.png"
$iconPath = Join-Path $scriptDirectory $iconFileName

$loadingForm = New-Object System.Windows.Forms.Form
$loadingForm.Text = "SASPClean Loading Screen"
$loadingForm.Size = New-Object System.Drawing.Size(400, 150)
$loadingForm.StartPosition = "CenterScreen"
$loadingForm.BackColor = [System.Drawing.Color]::FromArgb(255, 245, 245, 245)

$loadingLabelPackageJson = New-Object System.Windows.Forms.Label
$loadingLabelPackageJson.Text = "Checking for updates..."
$loadingLabelPackageJson.Font = New-Object System.Drawing.Font("Arial", 12, [System.Drawing.FontStyle]::Bold)
$loadingLabelPackageJson.AutoSize = $true
$loadingLabelPackageJson.Location = New-Object System.Drawing.Point(20, 45)
$loadingForm.Controls.Add($loadingLabelPackageJson)

$loadingForm.add_Shown({
        $iconFolder = Join-Path $scriptDirectory "icon"
        if (-not (Test-Path $iconFolder -PathType Container)) {
            [System.Windows.Forms.MessageBox]::Show("Error: 'icon' folder not found.", "Folder Not Found", "OK", "Error")
        }

        $iconPath = Join-Path $scriptDirectory "icon\SASPClean.png"
        if (-not (Test-Path $iconPath -PathType Leaf)) {
            [System.Windows.Forms.MessageBox]::Show("Error: 'icon\SASPClean.png' not found.", "File Not Found", "OK", "Error")
        }

        $packageJsonPath = Join-Path $scriptDirectory "package.json"
        $packageJsonExists = Test-Path $packageJsonPath
        if (-not $packageJsonExists) {
            [System.Windows.Forms.MessageBox]::Show("Error: 'package.json' not found.", "File Not Found", "OK", "Error")
        }

        $latestRelease = Invoke-RestMethod -Uri "https://api.github.com/repos/sasprosko590/SASPClean/releases/latest"
        if ($packageJsonExists) {
            $packageJson = Get-Content -Path $packageJsonPath | ConvertFrom-Json
            $currentVersion = "V" + $packageJson.version

            if ($latestRelease.tag_name -ne $currentVersion) {
                $updateMessage = "A new version is available! Do you want to view the release?"
                $userChoice = [System.Windows.Forms.MessageBox]::Show($updateMessage, "Update Available", "YesNo", "Information")

                if ($userChoice -eq "Yes") {
                    Start-Process $latestRelease.html_url
                }
            }
        }
        $loadingForm.Close()
    })

$form = New-Object System.Windows.Forms.Form
$form.Text = "SASPClean"
$scriptPath = $MyInvocation.MyCommand.Path
$scriptDirectory = Split-Path $scriptPath -Parent
$image = [System.Drawing.Image]::FromFile($iconPath)
$icon = [System.Drawing.Icon]::FromHandle((New-Object System.Drawing.Bitmap($image)).GetHicon())
$form.Icon = $icon
$form.Size = New-Object System.Drawing.Size(1225, 600)
$form.StartPosition = "CenterScreen"
$form.AutoScroll = $true

$backgroundColor = [System.Drawing.Color]::FromArgb(255, 245, 245, 245)
$buttonColor = [System.Drawing.Color]::FromArgb(255, 0, 102, 204)
$buttonForeColor = [System.Drawing.Color]::White
$form.BackColor = $backgroundColor

$checkboxes = @{}
$checkboxOptions = @(
    "Clear Windows Update - This command is designed to remove unnecessary files and optimize the Windows component store, helping to free up storage space on your system.",
    "Check Disk - Basic (chkdsk /f) - This command examines the disk for errors and automatically addresses and repairs any issues it discovers.",
    "Check Disk - Repair (chkdsk /r) - This command thoroughly checks the disk for errors, actively fixes identified issues, and recovers readable information to maintain disk health.",
    "Check Disk External Drive Dismounted (chkdsk /x) - This command dismounts external drives and performs a disk check, identifying and addressing errors to ensure the health of the external storage.",
    "DISM Add Packages - Adds Windows packages from a specified path to enhance system functionality.",
    "DISM Check Health - Evaluates the health of the Windows image, ensuring the stability of system components.",
    "DISM Get Packages - Lists all installed packages on the Windows image, providing an overview of system components.",
    "DISM Repair - It will check your system for missing files, malicious files, windows files, etc., repair and download anything that is missing.",
    "DISM Restore Health - Restores the health of the Windows image, addressing any detected inconsistencies.",
    "DISM Update - Updates your DISM."
    "Disk Cleaner - Opens the built-in Disk Cleanup utility, allowing removal of unnecessary files to free up disk space.",
    "Disk Cleaner Sagerun -  Executes the Disk Cleanup utility with predefined cleanup options, streamlining the removal of temporary files.",
    "MDT (Windows Memory Diagnostic Tool) -  Opens the Windows Memory Diagnostic Tool, allowing you to assess and diagnose potential issues related to your system's memory (RAM).",
    "MRT (Windows Malicious Software Removal Tool) - Opens the Windows Malicious Software Removal Tool, scanning and removing specific types of malware to enhance system security.",
    "File System Integrity Check - This command runs the System File Checker, ensuring the integrity of system files by scanning and repairing any detected problems.",
    "Windows Experience Index Formal Assessment - Initiates a detailed evaluation of your system's performance through the Windows Experience Index. It provides valuable insights into the capabilities of both your hardware and software.",
    "Upgrade winget - Utilizes the Windows Package Manager (Winget) to upgrade all installed applications, ensuring you have the latest versions with improved features and security updates.",
    "Check Win Update - Looks for the latest Windows updates right away, ensuring your system is current with essential patches and improvements.",
    "See if you have been hacked - Verifies possible security breaches on your system.",
    "High performance - Open the 'Power options' tab and select high performance.",
    "Game Mode - Open the tab called 'game mode settings' and activate 'game mode' in it.",
    "Performance Options Tab and Performance Optimization - Open the 'View settings' tab and turn it on and off as you wish, my suggestion is to look at `README.md` from github."
    "Initiate file cleanup - Deletes specific files, including those in the Prefetch, Temp, and %temp% directories, freeing up disk space and removing temporary files that are no longer needed."
)

$yPosition = 20
foreach ($option in $checkboxOptions) {
    $checkbox = New-Object System.Windows.Forms.CheckBox
    $checkbox.Text = $option
    $checkbox.Location = New-Object System.Drawing.Point(20, $yPosition)
    $checkbox.AutoSize = $true
    $checkbox.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
    $checkbox.ForeColor = [System.Drawing.Color]::FromArgb(255, 33, 33, 33)
    $form.Controls.Add($checkbox)
    $checkboxes[$option] = $checkbox
    $yPosition += 25
}

$runButton = New-Object System.Windows.Forms.Button
$runButton.Text = "Run"
$runButton.Location = New-Object System.Drawing.Point(20, $yPosition)
$runButton.BackColor = $buttonColor
$runButton.ForeColor = $buttonForeColor
$runButton.Width = 100
$runButton.Add_Click({
        foreach ($option in $checkboxOptions) {
            if ($checkboxes[$option].Checked) {
                Write-Host "Running $option"
                switch -wildcard ($option) {
                    "Check Disk - Basic*" { 
                        Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "chkdsk /f" -Wait
                    }
                    "Check Disk External Drive Dismounted*" { 
                        Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "chkdsk /x" -Wait
                    }
                    "Check Disk - Repair*" { 
                        Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "chkdsk /r" -Wait
                    }
                    "Check Win Update*" { 
                        Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "wuauclt.exe /detectnow" -Wait
                    }
                    "Clear Windows Update*" { 
                        Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "dism /online /cleanup-image /startcomponentcleanup" -Wait
                        Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "dism /online /cleanup-image /spsuperseded" -Wait
                    }
                    "Disk Cleaner*" { 
                        Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "cleanmgr.exe" -Wait
                    }
                    "Disk Cleaner Sagerun*" { 
                        Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "cleanmgr /sagerun:1" -Wait
                    }
                    "DISM Add Packages*" { 
                        Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "dism /online /add-package /packagepath:C:\path\to\update.cab" -Wait
                    }
                    "DISM Check Health*" { 
                        Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "dism /online /cleanup-image /checkhealth" -Wait
                    }
                    "DISM Get Packages*" { 
                        Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/k", "dism /online /get-packages" -Wait
                    }
                    "DISM Repair*" { 
                        Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "dism /online /cleanup-image /restorehealth /source:C:\path\to\source /limitaccess" -Wait
                        Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "dism /online /cleanup-image /restorehealth /source:C:\RepairSource\Windows /limitaccess" -Wait
                        Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "dism /online /cleanup-image /restorehealth /source:C:\path\to\repairsource\install.wim" -Wait
                    }
                    "DISM Update*" {
                        Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "dism /online /checkhealth" -Wait
                    }
                    "DISM Restore Health*" { 
                        Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "dism /online /cleanup-image /restorehealth" -Wait
                    }
                    "MDT (Windows Memory Diagnostic Tool)*" { 
                        Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "mdsched.exe" -Wait
                    }
                    "MRT (Windows Malicious Software Removal Tool)*" { 
                        Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/k", "mrt.exe" -Wait
                    }
                    "File System Integrity Check*" { 
                        Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "sfc /scannow" -Wait
                    }
                    "See if you have been hacked*" { 
                        Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/k", "quser" -Wait
                    }
                    "High Performance*" {
                        Start-Process "powercfg.cpl" -Verb RunAs
                    }
                    "Game Mode*" {
                        Start-Process 'ms-settings:gaming-gamemode'
                    }
                    "Performance Options Tab and Performance Optimization*" {
                        SystemPropertiesPerformance
                        Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "dism /online /Cleanup-Image /StartComponentCleanup /ResetBase" -Wait
                    }
                    "Upgrade winget*" { 
                        Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/k", "winget upgrade --all" -Wait
                    }
                    "Windows Experience Index Formal Assessment*" { 
                        Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "winsat formal" -Wait
                    }
                    "Initiate file cleanup*" {
                        Start-Process 'cmd.exe' -ArgumentList "/c", "npm install" -Wait
                        Start-Process 'cmd.exe' -ArgumentList "/k node test\index.test.js & pause"
                    }
                }            
            }
        }
    })
$form.Controls.Add($runButton)

$Form.add_closing{
    if (-not $RanScript -and [Windows.Forms.MessageBox]::Show('Are you sure you want to exit?', 'Exit', 'YesNo', 'Question') -eq 'No') {
        $_.Cancel = $true
    }
}

$loadingForm.ShowDialog()
$form.ShowDialog()
