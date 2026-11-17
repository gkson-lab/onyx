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

call :refresh_path
call :need node OpenJS.NodeJS.LTS "Node.js" "https://nodejs.org (the LTS version)" || goto :stop
call :need git Git.Git "Git" "https://git-scm.com" || goto :stop
call :need ollama Ollama.Ollama "Ollama" "https://ollama.com" || goto :stop

call :find_pnpm
if not defined PNPM (
  echo Installing pnpm...
  call npm install -g pnpm
  call :refresh_path
  call :find_pnpm
)
if not defined PNPM (
  echo.
  echo  pnpm could not be installed. Open PowerShell, run:  npm install -g pnpm
  echo  then run "Setup Onyx" again.
  goto :stop
)
echo Found Node.js, Git, Ollama and pnpm.

call :ollama_up

echo.
echo [1/4] Installing Onyx's packages...
call "%PNPM%" install || goto :failed
echo.
echo [2/4] Building the app...
call "%PNPM%" build || goto :failed
echo.
echo [3/4] Choosing models for this PC and downloading them...
call "%PNPM%" onyx setup || goto :failed

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

:need
where %1 >nul 2>nul && exit /b 0
where winget >nul 2>nul || goto :need_manual
echo Installing %~3...
winget install -e --id %2 --accept-package-agreements --accept-source-agreements
call :refresh_path
where %1 >nul 2>nul && exit /b 0
:need_manual
echo.
echo  %~3 is needed, and it could not be installed or found automatically.
echo  Install it from %~4, then run "Setup Onyx" again.
exit /b 1

:failed
echo.
echo  Setup stopped: the step above failed, and its message says why.
echo  Send that message to whoever is helping you, or fix it and run "Setup Onyx" again.
:stop
echo.
pause
exit /b 1

:refresh_path
rem Windows only gives new program locations to windows opened after you sign in again. Read them fresh instead.
for /f "usebackq delims=" %%P in (`powershell -NoProfile -Command "[Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')"`) do set "PATH=%%P;%ProgramFiles%\nodejs;%APPDATA%\npm;%ProgramFiles%\Git\cmd;%LOCALAPPDATA%\Programs\Ollama"
exit /b 0

:find_pnpm
set "PNPM="
for /f "delims=" %%X in ('where pnpm.cmd 2^>nul') do if not defined PNPM set "PNPM=%%X"
if not defined PNPM for /f "delims=" %%X in ('where pnpm.exe 2^>nul') do if not defined PNPM set "PNPM=%%X"
if not defined PNPM if exist "%APPDATA%\npm\pnpm.cmd" set "PNPM=%APPDATA%\npm\pnpm.cmd"
exit /b 0

:ollama_up
tasklist /FI "IMAGENAME eq ollama.exe" 2>nul | find /I "ollama.exe" >nul
if not errorlevel 1 exit /b 0
echo Starting Ollama...
if exist "%LOCALAPPDATA%\Programs\Ollama\ollama app.exe" start "" "%LOCALAPPDATA%\Programs\Ollama\ollama app.exe"
timeout /t 8 /nobreak >nul
exit /b 0
