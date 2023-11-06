@echo off

REM Prompt user to select a language
:ask_language
set /p "language=Select a language (tr/en/de): "
if /i "%language%"=="en" (
  goto :english
) else if /i "%language%"=="tr" (
  goto :turkish
) else if /i "%language%"=="de" (
  goto :german
) else (
  echo Invalid input. Please enter 'en' for English, 'tr' for Turkish or 'de' for German.
  goto :ask_language
)

:turkish
REM Sorulari ve komutlari tanimla
set "soru[1]=Windows Guncellemelerini Temizle - Bu komut, Windows uzerindeki gereksiz dosyalari ve bilesen deposunu temizler."
set "komut[1]=dism /online /cleanup-image /startcomponentcleanup"

set "soru[2]=Disk Kontrolu - Temel (chkdsk /f) - Bu komut, diskteki hatalari kontrol eder ve duzeltir."
set "komut[2]=chkdsk /f"

set "soru[3]=Disk Kontrolu - Onar (chkdsk /r) - Bu komut, diskteki hatalari kontrol eder, duzeltir ve okunabilir bilgileri kurtarir."
set "komut[3]=chkdsk /r"

set "soru[4]=Disk Kontrolu - Harici Surucu Ayirmali (chkdsk /x) - Bu komut, harici suruculeri ayirir ve diski kontrol eder."
set "komut[4]=chkdsk /x"

set "soru[5]=DISM Paketleri Ekle - Bu komut, belirtilen yoldan Windows paketlerini ekler."
set "komut[5]=dism /online /add-package /packagepath:C:\path\to\update.cab"

set "soru[6]=DISM Saglik Kontrolu - Bu komut, Windows gorselini kontrol eder."
set "komut[6]=dism /online /cleanup-image /checkhealth"

set "soru[7]=DISM Paketleri Listele - Bu komut, Windows gorseline yuklenmis tum paketleri listeler."
set "komut[7]=dism /online /get-packages"

set "soru[8]=DISM Onar - Bu komut, belirtilen kaynaktan Windows gorselini onarir."
set "komut[8]=dism /online /cleanup-image /restorehealth /source:C:\path\to\source /limitaccess"

set "soru[9]=DISM Onar 2 - Bu komut, baska bir belirtilen kaynaktan Windows gorselini onarir."
set "komut[9]=dism /online /cleanup-image /restorehealth /source:C:\path\to\repairsource\install.wim"

set "soru[10]=DISM Saglik Geri Yukle - Bu komut, Windows gorselinin sagligini geri yukler."
set "komut[10]=dism /online /cleanup-image /restorehealth"

set "soru[11]=Disk Temizleyici - Bu komut, yerlesik Disk Temizleyici aracini acar."
set "komut[11]=cleanmgr.exe"

set "soru[12]=Disk Temizleyici Sagerun - Bu komut, onceden belirlenmis temizleme secenekleriyle Disk Temizleyici aracini calistirir."
set "komut[12]=cleanmgr /sagerun:1"

set "soru[13]=MDT (Windows Bellek Tani Araci) - Bu komut, Windows Bellek Tani Aracini acar."
set "komut[13]=mdsched.exe"

set "soru[14]=MRT (Windows Zararli Yazilim Kaldirma Araci) - Bu komut, Windows Zararli Yazilim Kaldirma Aracini acar."
set "komut[14]=mrt.exe"

set "soru[15]=Tarama - Bu komut, Sistem Dosyasi Denetleyicisi'ni calistirir (sfc /scannow)."
set "komut[15]=sfc /scannow"

set "soru[16]=Windows Deneyim Endeksi Formel Degerlendirme - Bu komut, Windows Deneyim Endeksi formel degerlendirmesini calistirir."
set "komut[16]=winsat formal"

set "soru[17]=Winget Guncelleme - Bu komut, Windows Paket Yoneticisi (Winget) kullanarak yuklu tum uygulamalari gunceller."
set "komut[17]=winget upgrade -all"

set "soru[18]=Windows Guncelleme Kontrolu - Bu komut, Windows guncellemelerini kontrol eder."
set "komut[18]=wuauclt.exe /detectnow"

set "soru[19]=Hacklenip hacklenmedigini gorme - Bu komut, hacklenip hacklenmedigini gosterir. (calismassa cmd yi acip 'quser' yazin.)"
set "komut[19]=quser"

:sor_nodejs
REM Kullanicilara Node.js kurulu olup olmadigina dair bir soru sor
set /p "nodejs=Node.js kurulu mu? (e/h): "
if /i "%nodejs%"=="e" (
  goto :sor_init
) else if /i "%nodejs%"=="h" (
  echo https://nodejs.org/en
  goto :sor_init
) else (
  echo Gecersiz giris. Lutfen 'e' veya 'h' girin.
  goto :sor_nodejs
)

:sor_init
REM Kullanicilara 'npm init -y' ile ilgili bir soru sor
set /p "init='npm init -y' baslatilsin mi? (ilk kez npm yukleniyorsa 'e' girin.) (e/h): "
if /i "%init%"=="e" (
  REM npm init komutunu calistir
  call npm init -y
) else if /i "%init%"=="h" (
  echo NPM paketi baslatilamadi.
) else (
  echo Gecersiz giris. Lutfen 'e' veya 'h' girin.
  goto :sor_init
)

:sor_kurulum
REM Kullanicilara 'npm install' ile ilgili bir soru sor
call npm install

:ek_komutlari_calistir
REM Ek sorulari ve komutlari calistir
setlocal enabledelayedexpansion
set "soruIndeksi=1"

:ek_komut_dongusu
if !soruIndeksi! leq 19 (
  set /p "komut_calistir=!soru[%soruIndeksi%]! Bu komutu calistirmak ister misiniz? (e/h): "
  if /i "!komut_calistir!"=="e" (
    call :komutu_calistir %soruIndeksi%
  ) else if /i "!komut_calistir!"=="h" (
    echo Komut gecildi: %soruIndeksi%.
  ) else (
    echo Gecersiz giris. Lutfen 'e' veya 'h' girin.
  )
  set /a "soruIndeksi+=1"
  goto :ek_komut_dongusu
)

endlocal

call node test\index.test.js

pause

exit /b

:komutu_calistir
REM Belirtilen komutu calistir
call powershell -Command "& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', '!komut[%1]!' -Wait }"
exit /b

:english

REM Defining questions and commands
set "question[1]=Clear Windows Update - This command is used to clean up junk files and the component store on Windows."
set "command[1]=dism /online /cleanup-image /startcomponentcleanup"

set "question[2]=Check Disk - Basic (chkdsk /f) - This command checks for errors on the disk and fixes them."
set "command[2]=chkdsk /f"

set "question[3]=Check Disk - Repair (chkdsk /r) - This command checks for errors on the disk, fixes them, and recovers readable information."
set "command[3]=chkdsk /r"

set "question[4]=Check Disk - External Drive Dismounted (chkdsk /x) - This command dismounts external drives and checks the disk for errors."
set "command[4]=chkdsk /x"

set "question[5]=DISM Add Packages - This command adds Windows packages from a specified path."
set "command[5]=dism /online /add-package /packagepath:C:\path\to\update.cab"

set "question[6]=DISM Check Health - This command checks the health of the Windows image."
set "command[6]=dism /online /cleanup-image /checkhealth"

set "question[7]=DISM Get Packages - This command lists all installed packages on the Windows image."
set "command[7]=dism /online /get-packages"

set "question[8]=DISM Repair - This command repairs the Windows image using a specified source."
set "command[8]=dism /online /cleanup-image /restorehealth /source:C:\path\to\source /limitaccess"

set "question[9]=DISM Repair 2 - This command repairs the Windows image using another specified source."
set "command[9]=dism /online /cleanup-image /restorehealth /source:C:\path\to\repairsource\install.wim"

set "question[10]=DISM Restore Health - This command restores the health of the Windows image."
set "command[10]=dism /online /cleanup-image /restorehealth"

set "question[11]=Disk Cleaner - This command opens the built-in Disk Cleanup utility."
set "command[11]=cleanmgr.exe"

set "question[12]=Disk Cleaner Sagerun - This command runs the Disk Cleanup utility with a predefined set of cleanup options."
set "command[12]=cleanmgr /sagerun:1"

set "question[13]=MDT (Windows Memory Diagnostic Tool) - This command opens the Windows Memory Diagnostic Tool."
set "command[13]=mdsched.exe"

set "question[14]=MRT (Windows Malicious Software Removal Tool) - This command opens the Windows Malicious Software Removal Tool."
set "command[14]=mrt.exe"

set "question[15]=Scan - This command runs the System File Checker (sfc /scannow)."
set "command[15]=sfc /scannow"

set "question[16]=Windows Experience Index Formal Assessment - This command runs the Windows Experience Index formal assessment."
set "command[16]=winsat formal"

set "question[17]=Upgrade winget - This command upgrades all installed apps using Windows Package Manager (Winget)."
set "command[17]=winget upgrade -all"

set "question[18]=Check Win Update - This command checks for Windows updates immediately."
set "command[18]=wuauclt.exe /detectnow"

set "question[19]=See if you have been hacked - This command shows if you have been hacked. (if it doesn't work, open cmd and type 'quser')."
set "command[19]=quser"

:ask_nodejs
REM Ask a question to the user about Node.js installation
set /p "nodejs=Have you installed Node.js? (y/n): "
if /i "%nodejs%"=="y" (
  goto :ask_init
) else if /i "%nodejs%"=="n" (
  echo https://nodejs.org/en
  goto :ask_init
) else (
  echo Invalid input. Please enter 'y' or 'n'.
  goto :ask_nodejs
)

:ask_init
REM Ask a question to the user about 'npm init -y'
set /p "init=Initialize 'npm init -y' (type 'y' if you are installing npm for the first time) (y/n): "
if /i "%init%"=="y" (
  REM Run the npm init command
  call npm init -y
) else if /i "%init%"=="n" (
  echo NPM package was not initialized.
) else (
  echo Invalid input. Please enter 'y' or 'n'.
  goto :ask_init
)

:ask_install
REM install 'npm install'
call npm install

:run_additional_commands
REM Run additional questions and commands
setlocal enabledelayedexpansion
set "questionIndex=1"

:run_additional_cmd_loop
if !questionIndex! leq 19 (
  set /p "run_command=!question[%questionIndex%]! Do you want to run this command? (y/n): "
  if /i "!run_command!"=="y" (
    call :run_command %questionIndex%
  ) else if /i "!run_command!"=="n" (
    echo Skipped command %questionIndex%.
  ) else (
    echo Invalid input. Please enter 'y' or 'n'.
  )
  set /a "questionIndex+=1"
  goto :run_additional_cmd_loop
)

endlocal

call node test\index.test.js

pause

exit /b

:run_command
REM Run the specified command
call powershell -Command "& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', '!command[%1]!' -Wait }"
exit /b

:german

REM Definition von Fragen und Befehlen
set "question[1]=Windows Update löschen - Dieser Befehl wird verwendet, um Junk-Dateien und den Komponentenspeicher unter Windows zu bereinigen."
set "command[1]=dism /online /cleanup-image /startcomponentcleanup"

set "question[2]=Festplattenprüfung - Grundlegende (chkdsk /f) - Dieser Befehl überprüft Fehler auf der Festplatte und behebt sie."
set "command[2]=chkdsk /f"

set "question[3]=Festplattenprüfung - Reparatur (chkdsk /r) - Dieser Befehl überprüft Fehler auf der Festplatte, behebt sie und stellt lesbare Informationen wieder her."
set "command[3]=chkdsk /r"

set "question[4]=Festplattenprüfung - Externe Laufwerke aushängen (chkdsk /x) - Dieser Befehl hängt externe Laufwerke aus und überprüft die Festplatte auf Fehler."
set "command[4]=chkdsk /x"

set "question[5]=DISM Pakete hinzufügen - Dieser Befehl fügt Windows-Pakete von einem bestimmten Pfad hinzu."
set "command[5]=dism /online /add-package /packagepath:C:\path\to\update.cab"

set "question[6]=DISM Überprüfen der Integrität - Dieser Befehl überprüft die Integrität des Windows-Abbilds."
set "command[6]=dism /online /cleanup-image /checkhealth"

set "question[7]=DISM Pakete abrufen - Dieser Befehl listet alle installierten Pakete im Windows-Abbild auf."
set "command[7]=dism /online /get-packages"

set "question[8]=DISM Reparatur - Dieser Befehl repariert das Windows-Abbild unter Verwendung einer angegebenen Quelle."
set "command[8]=dism /online /cleanup-image /restorehealth /source:C:\path\to\source /limitaccess"

set "question[9]=DISM Reparatur 2 - Dieser Befehl repariert das Windows-Abbild unter Verwendung einer anderen angegebenen Quelle."
set "command[9]=dism /online /cleanup-image /restorehealth /source:C:\path\to\repairsource\install.wim"

set "question[10]=DISM Integrität wiederherstellen - Dieser Befehl stellt die Integrität des Windows-Abbilds wieder her."
set "command[10]=dism /online /cleanup-image /restorehealth"

set "question[11]=Datenträgerbereinigung - Dieser Befehl öffnet das integrierte Datenträgerbereinigungsprogramm."
set "command[11]=cleanmgr.exe"

set "question[12]=Datenträgerbereinigung Sagerun - Dieser Befehl führt das Datenträgerbereinigungsprogramm mit einem vordefinierten Satz von Bereinigungsoptionen aus."
set "command[12]=cleanmgr /sagerun:1"

set "question[13]=MDT (Windows Memory Diagnostic Tool) - Dieser Befehl öffnet das Windows Memory Diagnostic Tool."
set "command[13]=mdsched.exe"

set "question[14]=MRT (Windows Malicious Software Removal Tool) - Dieser Befehl öffnet das Windows Malicious Software Removal Tool."
set "command[14]=mrt.exe"

set "question[15]=Überprüfen - Dieser Befehl führt den System File Checker aus (sfc /scannow)."
set "command[15]=sfc /scannow"

set "question[16]=Formale Bewertung des Windows Experience Index - Dieser Befehl führt die formale Bewertung des Windows Experience Index aus."
set "command[16]=winsat formal"

set "question[17]=Winget aktualisieren - Dieser Befehl aktualisiert alle installierten Apps mit dem Windows Package Manager (Winget)."
set "command[17]=winget upgrade -all"

set "question[18]=Windows Update überprüfen - Dieser Befehl überprüft sofort auf Windows-Updates."
set "command[18]=wuauclt.exe /detectnow"

set "question[19]=Prüfen, ob Sie gehackt wurden - Dieser Befehl zeigt an, ob Sie gehackt wurden. (wenn das nicht funktioniert, öffnen Sie cmd und geben Sie 'quser' ein)."
set "command[19]=quser"

:ask_nodejs
REM Eine Frage an den Benutzer zur Installation von Node.js stellen
set /p "nodejs=Haben Sie Node.js installiert? (j/n): "
if /i "%nodejs%"=="j" (
  goto :ask_init
) else if /i "%nodejs%"=="n" (
  echo https://nodejs.org/en
  goto :ask_init
) else (
  echo Ungültige Eingabe. Bitte geben Sie 'j' oder 'n' ein.
  goto :ask_nodejs
)

:ask_init
REM Eine Frage an den Benutzer zu 'npm init -y' stellen
set /p "init=Initialisieren von 'npm init -y' (geben Sie 'j' ein, wenn Sie npm zum ersten Mal installieren) (j/n): "
if /i "%init%"=="j" (
  REM Führen Sie den npm init-Befehl aus
  call npm init -y
) else if /i "%init%"=="n" (
  echo Das NPM-Paket wurde nicht initialisiert.
) else (
  echo Ungültige Eingabe. Bitte geben Sie 'j' oder 'n' ein.
  goto :ask_init
)

:ask_install
REM 'npm install' installieren
call npm install

:run_additional_commands
REM Zusätzliche Fragen und Befehle ausführen
setlocal enabledelayedexpansion
set "questionIndex=1"

:run_additional_cmd_loop
if !questionIndex! leq 19 (
  set /p "run_command=!question[%questionIndex%]! Möchten Sie diesen Befehl ausführen? (j/n): "
  if /i "!run_command!"=="j" (
    call :run_command %questionIndex%
  ) else if /i "!run_command!"=="n" (
    echo Befehl %questionIndex% übersprungen.
  ) else (
    echo Ungültige Eingabe. Bitte geben Sie 'j' oder 'n' ein.
  )
  set /a "questionIndex+=1"
  goto :run_additional_cmd_loop
)

endlocal

call node test\index.test.js

pause

exit /b

:run_command
REM Den angegebenen Befehl ausführen
call powershell -Command "& { Start-Process cmd.exe -Verb RunAs -ArgumentList '/c', '!command[%1]!' -Wait }"
exit /b
