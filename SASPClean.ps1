$localePath = "language\locales"
$language = "en"

$envLang = [System.Globalization.CultureInfo]::CurrentCulture.Name
if ($envLang -like "de*") {
    $language = "de"
} elseif ($envLang -like "en*") {
    $language = "en"
} elseif ($envLang -like "tr*") {
    $language = "tr"
} elseif ($envLang -like "ar*") {
    $language = "ar"
} elseif ($envLang -like "es*") {
    $language = "es"
} elseif ($envLang -like "ru*") {
    $language = "ru"
} elseif ($envLang -like "zh*") {
    $language = "zh"
}

$localeFilePath = Join-Path -Path $localePath -ChildPath "$language.json"
if (Test-Path $localeFilePath) {
    $localeData = Get-Content -Path $localeFilePath -Encoding UTF8 | ConvertFrom-Json
} else {
    Write-Host "Language file not found. Default English language file will be used."
    $localeData = Get-Content -Path (Join-Path -Path $localePath -ChildPath "en.json") -Encoding UTF8 | ConvertFrom-Json
}

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$scriptPath = $MyInvocation.MyCommand.Path
$scriptDirectory = Split-Path $scriptPath -Parent

$packageJsonPath = Join-Path $scriptDirectory "package.json"
$packageJsonExists = Test-Path $packageJsonPath

$iconFileName = "icon\SASPClean.png"
$iconPath = Join-Path $scriptDirectory $iconFileName

$loadingForm = New-Object System.Windows.Forms.Form
$loadingForm.Text = $localeData.formTitle
$loadingForm.Size = New-Object System.Drawing.Size(400, 150)
$loadingForm.StartPosition = "CenterScreen"
$loadingForm.BackColor = [System.Drawing.Color]::FromArgb(255, 245, 245, 245)

$loadingLabelPackageJson = New-Object System.Windows.Forms.Label
$loadingLabelPackageJson.Text = $localeData.loadingScreen.checkingUpdates
$loadingLabelPackageJson.Font = New-Object System.Drawing.Font("Arial", 12, [System.Drawing.FontStyle]::Bold)
$loadingLabelPackageJson.AutoSize = $true
$loadingLabelPackageJson.Location = New-Object System.Drawing.Point(20, 45)
$loadingForm.Controls.Add($loadingLabelPackageJson)

$loadingForm.add_Shown({
    $iconFolder = Join-Path $scriptDirectory "icon"
    if (-not (Test-Path $iconFolder -PathType Container)) {
        [System.Windows.Forms.MessageBox]::Show($localeData.errorMessages.folderNotFound, "Folder Not Found", "OK", "Error")
        $loadingForm.Close()
        return
    }

    $iconPath = Join-Path $scriptDirectory "icon\SASPClean.png"
    if (-not (Test-Path $iconPath -PathType Leaf)) {
        [System.Windows.Forms.MessageBox]::Show($localeData.errorMessages.fileNotFound, "File Not Found", "OK", "Error")
        $loadingForm.Close()
        return
    }

    $packageJsonPath = Join-Path $scriptDirectory "package.json"
    if (-not (Test-Path $packageJsonPath -PathType Leaf)) {
        [System.Windows.Forms.MessageBox]::Show($localeData.errorMessages.packageJsonNotFound, "File Not Found", "OK", "Error")
        $loadingForm.Close()
        return
    }
    $latestRelease = Invoke-RestMethod -Uri "https://api.github.com/repos/sasprosko590/SASPClean/releases/latest"
    
    if ($packageJsonExists) {
        $packageJson = Get-Content -Path $packageJsonPath | ConvertFrom-Json
        $currentVersion = "V" + $packageJson.version
        if ($latestRelease.tag_name -ne $currentVersion) {
            $updateMessage = $localeData.updateMessages.newVersionAvailable
            $userChoice = [System.Windows.Forms.MessageBox]::Show($updateMessage, $localeData.updateMessages.updateAvailable, "YesNo", "Information")

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

$checkboxOptions = @(
    $localeData.checkDisk,
    $localeData.clearWindowsUpdate,
    $localeData.diskCleaner,
    $localeData.diskCleanerSagerun,
    $localeData.dismTools,
    $localeData.mdtTool,
    $localeData.mrtTool,
    $localeData.fileSystemCheck,
    $localeData.windowsExperienceIndex,
    $localeData.upgradePackages,
    $localeData.checkWinUpdate,
    $localeData.checkHacked,
    $localeData.performanceHigh,
    $localeData.gameMode,
    $localeData.performanceOptions,
    $localeData.systemInfo,
    $localeData.initiateFileCleanup
)

$checkboxes = @{}
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
$runButton.Text = $localeData.runButton
$runButton.Location = New-Object System.Drawing.Point(20, $yPosition)
$runButton.BackColor = $buttonColor
$runButton.ForeColor = $buttonForeColor
$runButton.Width = 100
$runButton.Add_Click({
    foreach ($option in $checkboxOptions) {
        if ($checkboxes[$option].Checked) {
            switch -wildcard ($option) {
                $localeData.checkDisk { 
                    Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/k", "chkdsk /f && chkdsk /x && chkdsk /r" -Wait
                }
                $localeData.clearWindowsUpdate { 
                    Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "dism /online /cleanup-image /startcomponentcleanup && dism /online /cleanup-image /spsuperseded" -Wait
                }
                $localeData.diskCleaner { 
                    Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "cleanmgr.exe" -Wait
                }
                $localeData.diskCleanerSagerun { 
                    Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "cleanmgr /sagerun:1" -Wait
                }
                $localeData.dismTools { 
                    Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "dism /online /add-package /packagepath:C:\path\to\update.cab" -Wait
                    Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "dism /online /cleanup-image /checkhealth" -Wait
                }
                $localeData.mdtTool { 
                    Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "mdsched.exe" -Wait
                }
                $localeData.mrtTool { 
                    Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/k", "mrt.exe" -Wait
                }
                $localeData.fileSystemCheck { 
                    Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "sfc /scannow" -Wait
                }
                $localeData.windowsExperienceIndex { 
                    Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "winsat formal" -Wait
                }
                $localeData.upgradePackages { 
                    $chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue
                    if ($null -eq $chocoInstalled) {
                        Write-Host "$localeData.chocolateyNotFound"
                        Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))" -Wait
                    } else {
                        Write-Host "$localeData.chocolateyInstalled"
                    }
                    Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/k", "choco upgrade all -y && winget upgrade --all" -Wait
                }
                $localeData.checkWinUpdate { 
                    Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/c", "wuauclt.exe /detectnow" -Wait
                }
                $localeData.checkHacked { 
                    Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/k", "quser" -Wait
                }
                $localeData.performanceHigh {
                    Start-Process "powercfg.cpl" -Verb RunAs
                }
                $localeData.gameMode {
                    Start-Process 'ms-settings:gaming-gamemode' -Wait
                }
                $localeData.performanceOptions {
                    SystemPropertiesPerformance
                }
                $localeData.systemInfo { 
                    Start-Process 'cmd.exe' -Verb RunAs -ArgumentList "/k", "systeminfo" -Wait
                }
                $localeData.initiateFileCleanup { 
                    Start-Process 'cmd.exe' -ArgumentList "/k", "npm install && node test\index.test.js && pause" -Wait
                }
            }
        }
    }
})

$form.Controls.Add($runButton)
$form.add_Closing({
    if (-not $RanScript -and [Windows.Forms.MessageBox]::Show($localeData.exitMessage, $localeData.exitTitle, 'YesNo', 'Question') -eq 'No') {
        $_.Cancel = $true
    }
})
$loadingForm.ShowDialog()
$form.ShowDialog()
