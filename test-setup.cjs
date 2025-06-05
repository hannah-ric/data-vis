#!/usr/bin/env node

/**
 * Test script to verify Data Visualization App setup
 */

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🔍 Data Visualization App - Setup Verification\n');

let hasErrors = false;

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
if (majorVersion < 16) {
  console.error('❌ Node.js version 16+ required. Current version:', nodeVersion);
  hasErrors = true;
} else {
  console.log('✅ Node.js version:', nodeVersion);
}

// Check if npm is available
try {
  const npmVersion = require('child_process').execSync('npm --version').toString().trim();
  console.log('✅ npm version:', npmVersion);
} catch (error) {
  console.error('❌ npm not found');
  hasErrors = true;
}

// Check if R is installed
const checkR = spawn('Rscript', ['--version'], { stdio: 'pipe' });
checkR.on('error', () => {
  console.warn('⚠️  R is not installed or not in PATH');
  console.log('   R features will not be available');
  console.log('   Install from: https://www.r-project.org/');
});
checkR.on('exit', (code) => {
  if (code === 0) {
    console.log('✅ R is installed');
  }
});

// Check required files
console.log('\n📁 Checking project structure:');
const requiredFiles = [
  'package.json',
  'vite.config.js',
  'src/App.jsx',
  'src/main.jsx',
  'backend/package.json',
  'backend/src/index.js',
  '.env'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.error(`❌ Missing: ${file}`);
    hasErrors = true;
  }
});

// Check if dependencies are installed
console.log('\n📦 Checking dependencies:');
if (fs.existsSync('node_modules')) {
  console.log('✅ Frontend dependencies installed');
} else {
  console.error('❌ Frontend dependencies not installed. Run: npm install');
  hasErrors = true;
}

if (fs.existsSync('backend/node_modules')) {
  console.log('✅ Backend dependencies installed');
} else {
  console.error('❌ Backend dependencies not installed. Run: cd backend && npm install');
  hasErrors = true;
}

// Check environment variables
console.log('\n🔧 Checking environment configuration:');
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  if (envContent.includes('VITE_API_URL') && envContent.includes('VITE_WS_URL')) {
    console.log('✅ Environment variables configured');
  } else {
    console.error('❌ Missing environment variables in .env');
    hasErrors = true;
  }
}

// Summary
console.log('\n📊 Summary:');
if (hasErrors) {
  console.error('❌ Setup has issues. Please fix the errors above.');
  process.exit(1);
} else {
  console.log('✅ Setup looks good!');
  console.log('\n🚀 To start the application:');
  console.log('   Option 1: npm run start:all');
  console.log('   Option 2: Start backend and frontend separately');
  console.log('            Terminal 1: cd backend && npm run dev');
  console.log('            Terminal 2: npm run dev');
}

process.exit(0); 