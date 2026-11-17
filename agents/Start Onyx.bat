@echo off
setlocal EnableExtensions
title Onyx
cd /d "%~dp0"

call :refresh_path
call :find_pnpm
if not defined PNPM goto :not_set_up
if not exist "node_modules" goto :not_set_up
if not exist "apps\web\out\index.html" goto :not_set_up

call :ollama_up

rem Shares Onyx with your phone through Tailscale, when Tailscale is installed and signed in. Harmless otherwise.
where tailscale >nul 2>nul && tailscale serve --bg 8787 >nul 2>nul

rem Opens the app in your browser once the server is up.
start "" /min cmd /c "timeout /t 8 /nobreak >nul & start http://127.0.0.1:8787"

echo.
echo  Onyx is starting at http://127.0.0.1:8787
echo  Keep this window open: closing it stops Onyx.
echo.
call "%PNPM%" start
echo.
echo  Onyx stopped. If that was not you, the message above says why.
pause
exit /b 1

:not_set_up
echo.
echo  Onyx is not set up yet, or setup did not finish. Run "Setup Onyx" first, in this same folder.
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
