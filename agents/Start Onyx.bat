@echo off
setlocal
title Onyx
cd /d "%~dp0"

rem Ollama has to be running for Onyx to have models.
tasklist /FI "IMAGENAME eq ollama.exe" 2>nul | find /I "ollama.exe" >nul
if errorlevel 1 (
  echo Starting Ollama...
  if exist "%LOCALAPPDATA%\Programs\Ollama\ollama app.exe" start "" "%LOCALAPPDATA%\Programs\Ollama\ollama app.exe"
  timeout /t 6 /nobreak >nul
)

if not exist "apps\web\out\index.html" (
  echo Onyx is not set up yet. Run "Setup Onyx" first.
  pause
  exit /b 1
)

rem Shares Onyx with your phone through Tailscale, when Tailscale is installed and signed in. Harmless otherwise.
where tailscale >nul 2>nul && tailscale serve --bg 8787 >nul 2>nul

rem Opens the app in your browser once the server is up.
start "" /min cmd /c "timeout /t 6 /nobreak >nul & start http://127.0.0.1:8787"

echo.
echo  Onyx is running at http://127.0.0.1:8787
echo  Keep this window open: closing it stops Onyx.
echo.
call pnpm start
echo.
echo  Onyx stopped. If that was not you, the message above says why.
pause
