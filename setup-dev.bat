@echo off
echo Data Visualization Platform - Windows Setup
echo ==========================================
echo.
echo This will run the setup script for Windows.
echo You may need to allow script execution when prompted.
echo.
pause

REM Run PowerShell script with execution policy bypass
powershell -ExecutionPolicy Bypass -File setup-dev.ps1

pause 