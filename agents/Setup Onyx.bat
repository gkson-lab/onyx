@echo off
setlocal EnableExtensions
title Onyx setup
cd /d "%~dp0"
echo.
echo  Onyx setup
echo  ----------
echo  Installs what is missing, builds Onyx, picks models for this PC and downloads them.
echo  The model downloads are large (about 36 GB on a 16 GB graphics card). Safe to run again.
echo.

set "NEED_RESTART="
where winget >nul 2>nul
if errorlevel 1 (
  where node >nul 2>nul || goto :manual
  where ollama >nul 2>nul || goto :manual
) else (
  where node >nul 2>nul || call :install OpenJS.NodeJS.LTS "Node.js"
  where git >nul 2>nul || call :install Git.Git "Git"
  where ollama >nul 2>nul || call :install Ollama.Ollama "Ollama"
)
if defined NEED_RESTART (
  echo.
  echo  New programs were installed. Windows only sees them in a new window:
  echo  close this window and run "Setup Onyx" again.
  echo.
  pause
  exit /b 0
)

where pnpm >nul 2>nul
if errorlevel 1 (
  echo Installing pnpm...
  call npm install -g pnpm || goto :fail
  echo.
  echo  pnpm was installed. Close this window and run "Setup Onyx" again.
  pause
  exit /b 0
)

call :ollama_up

echo.
echo [1/4] Installing Onyx's packages...
call pnpm install || goto :fail
echo.
echo [2/4] Building the app...
call pnpm build || goto :fail
echo.
echo [3/4] Choosing models for this PC and downloading them...
call pnpm onyx setup || goto :fail

echo.
echo [4/4] Restarting Ollama so its new settings apply...
taskkill /IM "ollama app.exe" /F >nul 2>nul
taskkill /IM ollama.exe /F >nul 2>nul
timeout /t 2 /nobreak >nul
call :ollama_up

powershell -NoProfile -Command "$s=(New-Object -ComObject WScript.Shell).CreateShortcut([Environment]::GetFolderPath('Desktop')+'\Onyx.lnk'); $s.TargetPath='%~dp0Start Onyx.bat'; $s.WorkingDirectory='%~dp0'; $s.Save()" >nul 2>nul && echo Put an "Onyx" shortcut on your desktop.

echo.
echo  Done. Start Onyx with the "Onyx" shortcut on your desktop, or "Start Onyx" in this folder.
echo.
pause
exit /b 0

:install
echo Installing %~2...
winget install -e --id %1 --accept-package-agreements --accept-source-agreements
set "NEED_RESTART=1"
exit /b 0

:ollama_up
tasklist /FI "IMAGENAME eq ollama.exe" 2>nul | find /I "ollama.exe" >nul
if errorlevel 1 (
  if exist "%LOCALAPPDATA%\Programs\Ollama\ollama app.exe" start "" "%LOCALAPPDATA%\Programs\Ollama\ollama app.exe"
  timeout /t 6 /nobreak >nul
)
exit /b 0

:manual
echo.
echo  Install these first, then run "Setup Onyx" again:
echo    Node.js (the LTS version)  https://nodejs.org
echo    Git                        https://git-scm.com
echo    Ollama                     https://ollama.com
echo.
pause
exit /b 1

:fail
echo.
echo  Setup stopped: the step above failed. Its message says why. Fix that and run "Setup Onyx" again.
echo.
pause
exit /b 1
