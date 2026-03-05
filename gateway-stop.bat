@echo off
title Stop OpenClaw Gateway
echo ========================================
echo    Stopping OpenClaw Gateway Service
echo ========================================
echo.
echo WARNING: This will stop OpenClaw Gateway!
echo.
pause
echo.

set OPENCLAW_PATH=%APPDATA%\npm\openclaw.cmd

if exist "%OPENCLAW_PATH%" (
    call "%OPENCLAW_PATH%" daemon stop
    echo.
    echo ========================================
    echo Gateway service stop command sent!
) else (
    echo [ERROR] Cannot find openclaw.cmd
)

echo.
timeout /t 3 >nul
