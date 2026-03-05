@echo off
title Start OpenClaw Gateway
echo ========================================
echo    Starting OpenClaw Gateway Service
echo ========================================
echo.

set OPENCLAW_PATH=%APPDATA%\npm\openclaw.cmd

if exist "%OPENCLAW_PATH%" (
    call "%OPENCLAW_PATH%" daemon start
    echo.
    echo ========================================
    echo Gateway service start command sent!
) else (
    echo [ERROR] Cannot find openclaw.cmd
)

echo.
timeout /t 3 >nul
