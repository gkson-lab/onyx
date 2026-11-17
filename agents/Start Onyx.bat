@echo off
setlocal EnableExtensions
title Onyx
cd /d "%~dp0"

call :refresh_path
call :find_pnpm
if not defined PNPM goto :not_set_up
if not exist "node_modules" goto :not_set_up
if not exist "apps\web\out\index.html" goto :not_set_up

call :ollama_restart

rem Shares Onyx with your phone through Tailscale, once Tailscale is installed (Settings in the app shows how).
where tailscale >nul 2>nul && call :tailscale_serve

rem Opens the app in your browser once the server is up; not when Windows starts Onyx at sign-in (/background).
if /i not "%~1"=="/background" start "" /min cmd /c "timeout /t 8 /nobreak >nul & start http://127.0.0.1:8787"

echo.
echo  Onyx is starting at http://127.0.0.1:8787
echo  Keep this window open: closing it stops Onyx. It updates itself when GitHub has a new version.
echo.
rem The rest is one line on purpose. An update can replace this file while Onyx runs, and Windows reads a batch file
rem a line at a time as it goes: nothing below this line may be needed once Onyx has started. The launcher starts
rem Onyx, and after an update installs and builds the new version and starts it again.
set "ONYX_PNPM=%PNPM%" & node scripts\launcher.mjs & echo. & echo  Onyx stopped. If that was not you, the message above says why. & pause & exit /b 1

:not_set_up
echo.
echo  Onyx is not set up yet, or setup did not finish. Run "Setup Onyx" first, in this same folder.
echo.
pause
exit /b 1

:refresh_path
rem Windows only gives new program locations to windows opened after you sign in again. Read them fresh instead.
for /f "usebackq delims=" %%P in (`powershell -NoProfile -Command "[Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')"`) do set "PATH=%%P;%ProgramFiles%\nodejs;%APPDATA%\npm;%ProgramFiles%\Git\cmd;%LOCALAPPDATA%\Programs\Ollama;%ProgramFiles%\Tailscale"
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

:ollama_restart
rem Ollama reads its settings only when it starts. A copy started some other way (at sign-in, from the Start menu,
rem or by Ollama's own app) may run without them: a 4,096-token context that silently drops earlier messages. So
rem Onyx stops any running copy and starts Ollama itself, with the settings worked out for this PC.
call "%PNPM%" -s onyx ollama-env --save > "%TEMP%\onyx-ollama.env" 2>nul
for /f "usebackq delims=" %%L in (`findstr /R /C:"^OLLAMA_[A-Z_]*=" "%TEMP%\onyx-ollama.env"`) do set "%%L"
taskkill /IM "ollama app.exe" /F >nul 2>nul
taskkill /IM ollama.exe /F >nul 2>nul
taskkill /IM llama-server.exe /F >nul 2>nul
taskkill /IM ollama_llama_server.exe /F >nul 2>nul
timeout /t 2 /nobreak >nul
echo Starting Ollama with Onyx's settings (context %OLLAMA_CONTEXT_LENGTH% tokens)...
start "Ollama for Onyx" /min ollama serve
timeout /t 5 /nobreak >nul
exit /b 0

:tailscale_serve
rem Already shared: nothing to do.
tailscale serve status 2>nul | findstr /C:"127.0.0.1:8787" >nul && exit /b 0
rem Otherwise share it, in a window of its own, so this one never waits on Tailscale. The first time, Tailscale may
rem print a link to allow sharing for your account and wait there until you have; if it fails, the window stays open.
start "Tailscale: sharing Onyx with your phone" cmd /c "tailscale serve --bg 8787 || pause"
exit /b 0
