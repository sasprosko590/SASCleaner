@echo off

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
REM Ask a question to the user about 'npm install'
set /p "install=Install 'npm i' (type 'y' if you are doing it for the first time, or even if you are not) (y/n):
if /i "%install%"=="y" (
  REM Run the npm install command
  call npm install
  echo Dependencies successfully installed.

  REM If npm install was successful, run the following command
  if exist node_modules (
    node test\index.test.js
  ) else (
    echo NPM package was not initialized or dependencies were not installed.
  )
) else if /i "%install%"=="n" (
  echo Dependencies were not installed.
) else (
  echo Invalid input. Please enter 'y' or 'n'.
  goto :ask_install
)

pause
