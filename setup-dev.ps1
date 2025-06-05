#!/usr/bin/env pwsh
# Data Visualization Platform - Development Setup Script for Windows
# Run this script in PowerShell as Administrator if needed

Write-Host "🚀 Data Visualization Platform - Development Setup" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a command exists
function Test-Command {
    param($Command)
    try {
        if (Get-Command $Command -ErrorAction Stop) {
            return $true
        }
    }
    catch {
        return $false
    }
}

# Function to download and install Node.js
function Install-NodeJS {
    Write-Host "📥 Node.js not found. Would you like to install it? (Y/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq 'Y' -or $response -eq 'y') {
        Write-Host "Downloading Node.js LTS..." -ForegroundColor Green
        $nodeUrl = "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi"
        $installer = "$env:TEMP\node-installer.msi"
        
        try {
            Invoke-WebRequest -Uri $nodeUrl -OutFile $installer
            Write-Host "Installing Node.js..." -ForegroundColor Green
            Start-Process msiexec.exe -Wait -ArgumentList "/i", $installer, "/quiet"
            Remove-Item $installer
            
            # Refresh PATH
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
            
            Write-Host "✅ Node.js installed successfully!" -ForegroundColor Green
            Write-Host "⚠️  Please restart PowerShell and run this script again." -ForegroundColor Yellow
            exit 0
        }
        catch {
            Write-Host "❌ Failed to install Node.js. Please install manually from https://nodejs.org/" -ForegroundColor Red
            exit 1
        }
    }
    else {
        Write-Host "Please install Node.js from https://nodejs.org/ and run this script again." -ForegroundColor Red
        exit 1
    }
}

# Check prerequisites
Write-Host "1️⃣ Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found" -ForegroundColor Red
    Install-NodeJS
}

# Check npm
if (Test-Command "npm") {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ npm not found" -ForegroundColor Red
    Install-NodeJS
}

# Check R (optional)
if (Test-Command "Rscript") {
    $rVersion = Rscript --version 2>&1 | Select-String -Pattern "version" | Select-Object -First 1
    Write-Host "✅ R found: $rVersion" -ForegroundColor Green
} else {
    Write-Host "⚠️  R not found (optional for R features)" -ForegroundColor Yellow
    Write-Host "   To install R: https://cran.r-project.org/bin/windows/base/" -ForegroundColor Gray
}

# Check Git
if (Test-Command "git") {
    $gitVersion = git --version
    Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
} else {
    Write-Host "⚠️  Git not found" -ForegroundColor Yellow
    Write-Host "   To install Git: https://git-scm.com/download/win" -ForegroundColor Gray
}

Write-Host ""
Write-Host "2️⃣ Setting up project structure..." -ForegroundColor Yellow

# Create necessary directories
$directories = @(
    "backend\logs",
    "backend\temp",
    "src\components",
    "src\hooks",
    "src\utils"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ Created directory: $dir" -ForegroundColor Green
    }
}

# Create .env file if it doesn't exist
if (!(Test-Path ".env")) {
    @"
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Created .env file" -ForegroundColor Green
}

# Create backend .env file if it doesn't exist
if (!(Test-Path "backend\.env")) {
    @"
NODE_ENV=development
PORT=3001
LOG_LEVEL=info
SESSION_SECRET=dev-secret-change-in-production
MAX_FILE_SIZE=52428800
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
"@ | Out-File -FilePath "backend\.env" -Encoding UTF8
    Write-Host "✅ Created backend\.env file" -ForegroundColor Green
}

Write-Host ""
Write-Host "3️⃣ Installing dependencies..." -ForegroundColor Yellow

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
try {
    npm install
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
try {
    Set-Location backend
    npm install
    Set-Location ..
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Install R packages if R is available
if (Test-Command "Rscript") {
    Write-Host ""
    Write-Host "4️⃣ Installing R packages (this may take a few minutes)..." -ForegroundColor Yellow
    
    $rScript = @'
packages <- c("ggplot2", "dplyr", "tidyr", "corrplot", "plotly", "base64enc")
install_if_missing <- function(p) {
  if (!require(p, character.only = TRUE, quietly = TRUE)) {
    install.packages(p, repos = "https://cran.rstudio.com/", quiet = TRUE)
  }
}
invisible(lapply(packages, install_if_missing))
cat("R packages installed successfully\n")
'@
    
    try {
        $rScript | Rscript -
        Write-Host "✅ R packages installed" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Some R packages may have failed to install" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "5️⃣ Running setup verification..." -ForegroundColor Yellow
node test-setup.js

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Start the development servers:" -ForegroundColor White
Write-Host "   Option A: Run both servers together" -ForegroundColor Gray
Write-Host "   > npm run start:all" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Option B: Run servers separately (recommended for development)" -ForegroundColor Gray
Write-Host "   Terminal 1:" -ForegroundColor Gray
Write-Host "   > cd backend" -ForegroundColor Yellow
Write-Host "   > npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Terminal 2:" -ForegroundColor Gray
Write-Host "   > npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - README.md for general information" -ForegroundColor Gray
Write-Host "   - TROUBLESHOOTING.md for common issues" -ForegroundColor Gray
Write-Host "   - backend/README.md for backend details" -ForegroundColor Gray
Write-Host ""

# Offer to start the application
Write-Host "Would you like to start the application now? (Y/N)" -ForegroundColor Yellow
$response = Read-Host
if ($response -eq 'Y' -or $response -eq 'y') {
    Write-Host "Starting application..." -ForegroundColor Green
    npm run start:all
} 