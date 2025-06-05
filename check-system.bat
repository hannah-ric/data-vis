@echo off
echo ========================================
echo System Requirements Check
echo ========================================
echo.

echo Checking Node.js...
node --version 2>nul
if %errorlevel% neq 0 (
    echo [X] Node.js NOT FOUND - Please install from https://nodejs.org/
) else (
    echo [√] Node.js found
)
echo.

echo Checking npm...
npm --version 2>nul
if %errorlevel% neq 0 (
    echo [X] npm NOT FOUND
) else (
    echo [√] npm found
)
echo.

echo Checking R...
Rscript --version 2>nul
if %errorlevel% neq 0 (
    echo [!] R not found (optional) - Install from https://www.r-project.org/
) else (
    echo [√] R found
)
echo.

echo Checking Git...
git --version 2>nul
if %errorlevel% neq 0 (
    echo [!] Git not found (optional) - Install from https://git-scm.com/
) else (
    echo [√] Git found
)
echo.

echo ========================================
pause 