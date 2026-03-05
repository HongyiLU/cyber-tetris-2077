@echo off
title Restart OpenClaw Gateway
echo ========================================
echo    Restarting OpenClaw Gateway Service
echo ========================================
echo.

set OPENCLAW_PATH=%APPDATA%\npm\openclaw.cmd

if exist "%OPENCLAW_PATH%" (
    call "%OPENCLAW_PATH%" daemon restart
    echo.
    echo ========================================
    echo Gateway service restart command sent!
) else (
    echo [ERROR] Cannot find openclaw.cmd
)

echo.
timeout /t 3 >nul
