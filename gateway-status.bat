@echo off
title OpenClaw Gateway Status
echo ========================================
echo    OpenClaw Gateway Status Check
echo ========================================
echo.

set OPENCLAW_PATH=%APPDATA%\npm\openclaw.cmd

if exist "%OPENCLAW_PATH%" (
    echo Using openclaw at: %OPENCLAW_PATH%
    echo.
    call "%OPENCLAW_PATH%" daemon status
) else (
    echo [ERROR] Cannot find openclaw.cmd at: %OPENCLAW_PATH%
    echo.
    echo Please make sure OpenClaw is installed via npm:
    echo   npm install -g openclaw
    echo.
)

echo.
echo ========================================
echo.
pause
