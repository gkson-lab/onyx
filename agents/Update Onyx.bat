@echo off
setlocal EnableExtensions
title Onyx update
cd /d "%~dp0"
rem Makes this copy the same as the newest Onyx on GitHub: new and changed files are downloaded, files GitHub no
rem longer has are removed. Your password and keys (.env), chats and settings (data\) and model choices
rem (config\*.local.yaml) stay. Works for a downloaded ZIP and for a git clone. "Update Onyx.bat /undo" puts back the
rem version from before the last update. Onyx also does this by itself while it runs (Settings, Updates).
call :refresh_path
call :find_pnpm
if not defined PNPM goto :not_set_up
if not exist "node_modules" goto :not_set_up
set "HOW="
if /i "%~1"=="/undo" set "HOW=--undo"
echo Getting the newest Onyx from GitHub...
rem One line on purpose: the update replaces this very file, and Windows reads a batch file a line at a time.
call "%PNPM%" -s onyx update %HOW% && call "%PNPM%" install && call "%PNPM%" build && (echo. & echo  Done. Start Onyx again to use it. & echo. & pause & exit /b 0) & echo. & echo  The update stopped at the step above; its message says why. & echo. & pause & exit /b 1

:not_set_up
echo.
echo  Onyx is not set up yet. Run "Setup Onyx" first, in this same folder.
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
