@echo off
title Run Script

where node > nul 2>&1
if %errorlevel% neq 0 (
  echo Node.js is not installed. Please install Node.js and run the script again.
  pause
  exit /b 1
)

REM Run the JavaScript code with Node.js
node index.test.js

REM Wait in case of an error
if %errorlevel% neq 0 (
  echo An error occurred. Please check the console output for details.
  pause
)

REM Exit
exit /b 0
