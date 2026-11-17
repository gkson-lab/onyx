@echo off
setlocal EnableExtensions
title Onyx update
cd /d "%~dp0"
call :refresh_path
call :find_pnpm
if not exist "..\.git" (
  echo.
  echo  This copy was downloaded as a ZIP, so it cannot update itself.
  echo  Download a new ZIP from https://github.com/gkson-lab/onyx and run "Setup Onyx" in it.
  echo.
  pause
  exit /b 1
)
echo Getting the latest Onyx...
git pull || goto :failed
call "%PNPM%" install || goto :failed
call "%PNPM%" build || goto :failed
echo.
echo  Updated. Start Onyx again to use the new version.
pause
exit /b 0
:failed
echo.
echo  The update stopped at the step above. Its message says why.
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
