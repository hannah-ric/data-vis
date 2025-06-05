#!/usr/bin/env node

/**
 * Data Visualization Platform - Cross-Platform Development Setup Script
 * This script requires Node.js to be already installed
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function checkCommand(command) {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function getCommandVersion(command, versionFlag = '--version') {
  try {
    return execSync(`${command} ${versionFlag}`, { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

async function main() {
  log('\n🚀 Data Visualization Platform - Development Setup', 'cyan');
  log('=================================================', 'cyan');
  
  // Step 1: Check prerequisites
  log('\n1️⃣  Checking prerequisites...', 'yellow');
  
  // Check Node.js
  const nodeVersion = getCommandVersion('node', '--version');
  if (nodeVersion) {
    logSuccess(`Node.js found: ${nodeVersion}`);
  } else {
    logError('Node.js not found. This script requires Node.js.');
    process.exit(1);
  }
  
  // Check npm
  const npmVersion = getCommandVersion('npm', '--version');
  if (npmVersion) {
    logSuccess(`npm found: ${npmVersion}`);
  } else {
    logError('npm not found.');
    process.exit(1);
  }
  
  // Check R (optional)
  if (checkCommand('Rscript')) {
    logSuccess('R is installed');
  } else {
    logWarning('R not found (optional for R features)');
    logInfo('To install R: https://www.r-project.org/');
  }
  
  // Check Git
  const gitVersion = getCommandVersion('git', '--version');
  if (gitVersion) {
    logSuccess(`Git found: ${gitVersion}`);
  } else {
    logWarning('Git not found');
    logInfo('To install Git: https://git-scm.com/');
  }
  
  // Step 2: Set up project structure
  log('\n2️⃣  Setting up project structure...', 'yellow');
  
  const directories = [
    'backend/logs',
    'backend/temp',
    'src/components',
    'src/hooks',
    'src/utils'
  ];
  
  directories.forEach(dir => {
    const fullPath = path.resolve(dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      logSuccess(`Created directory: ${dir}`);
    }
  });
  
  // Create .env file if it doesn't exist
  const envPath = path.resolve('.env');
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, `VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
`);
    logSuccess('Created .env file');
  }
  
  // Create backend .env file if it doesn't exist
  const backendEnvPath = path.resolve('backend/.env');
  if (!fs.existsSync(backendEnvPath)) {
    fs.writeFileSync(backendEnvPath, `NODE_ENV=development
PORT=3001
LOG_LEVEL=info
SESSION_SECRET=dev-secret-change-in-production
MAX_FILE_SIZE=52428800
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
`);
    logSuccess('Created backend/.env file');
  }
  
  // Step 3: Install dependencies
  log('\n3️⃣  Installing dependencies...', 'yellow');
  
  // Install frontend dependencies
  log('Installing frontend dependencies...', 'cyan');
  try {
    execSync('npm install', { stdio: 'inherit' });
    logSuccess('Frontend dependencies installed');
  } catch (error) {
    logError('Failed to install frontend dependencies');
    process.exit(1);
  }
  
  // Install backend dependencies
  log('\nInstalling backend dependencies...', 'cyan');
  try {
    execSync('npm install', { cwd: 'backend', stdio: 'inherit' });
    logSuccess('Backend dependencies installed');
  } catch (error) {
    logError('Failed to install backend dependencies');
    process.exit(1);
  }
  
  // Step 4: Install R packages if R is available
  if (checkCommand('Rscript')) {
    log('\n4️⃣  Installing R packages (this may take a few minutes)...', 'yellow');
    
    const rScript = `
packages <- c("ggplot2", "dplyr", "tidyr", "corrplot", "plotly", "base64enc")
install_if_missing <- function(p) {
  if (!require(p, character.only = TRUE, quietly = TRUE)) {
    install.packages(p, repos = "https://cran.rstudio.com/", quiet = TRUE)
  }
}
invisible(lapply(packages, install_if_missing))
cat("R packages checked/installed\\n")
`;
    
    try {
      const rProcess = spawn('Rscript', ['-e', rScript], { stdio: 'inherit' });
      await new Promise((resolve, reject) => {
        rProcess.on('close', (code) => {
          if (code === 0) {
            logSuccess('R packages installed');
            resolve();
          } else {
            logWarning('Some R packages may have failed to install');
            resolve();
          }
        });
        rProcess.on('error', reject);
      });
    } catch (error) {
      logWarning('Failed to install R packages');
    }
  }
  
  // Step 5: Run setup verification
  log('\n5️⃣  Running setup verification...', 'yellow');
  try {
    execSync('node test-setup.cjs', { stdio: 'inherit' });
  } catch (error) {
    logWarning('Setup verification encountered issues');
  }
  
  // Complete!
  log('\n🎉 Setup complete!', 'green');
  log('\n📋 Next steps:', 'cyan');
  log('1. Start the development servers:', 'bright');
  log('   Option A: Run both servers together', 'reset');
  log('   > npm run start:all', 'yellow');
  log('');
  log('   Option B: Run servers separately (recommended for development)', 'reset');
  log('   Terminal 1:', 'reset');
  log('   > cd backend && npm run dev', 'yellow');
  log('');
  log('   Terminal 2:', 'reset');
  log('   > npm run dev', 'yellow');
  log('');
  log('2. Open http://localhost:5173 in your browser', 'bright');
  log('');
  log('📚 Documentation:', 'cyan');
  log('   - README.md for general information', 'reset');
  log('   - TROUBLESHOOTING.md for common issues', 'reset');
  log('   - backend/README.md for backend details', 'reset');
  log('');
  
  // Offer to start the application
  const response = await question('Would you like to start the application now? (Y/N) ');
  rl.close();
  
  if (response.toLowerCase() === 'y') {
    log('Starting application...', 'green');
    require('./start-app.cjs');
  }
}

// Run the setup
main().catch(error => {
  logError(`Setup failed: ${error.message}`);
  rl.close();
  process.exit(1);
}); 