@echo off
setlocal enabledelayedexpansion
set "scriptName=SASPClean.ps1"
set "currentDir=%~dp0"
set "scriptPath=!currentDir!!scriptName!"
powershell.exe -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "!scriptPath!"
endlocal