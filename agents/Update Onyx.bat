@echo off
setlocal
title Onyx update
cd /d "%~dp0"
echo Getting the latest Onyx...
git pull || goto :fail
call pnpm install || goto :fail
call pnpm build || goto :fail
echo.
echo  Updated. Start Onyx again to use the new version.
pause
exit /b 0
:fail
echo.
echo  The update stopped at the step above. Its message says why.
pause
exit /b 1
