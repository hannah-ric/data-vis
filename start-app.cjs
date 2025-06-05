#!/usr/bin/env node

/**
 * Start script for the Data Visualization Application
 * Runs both frontend and backend servers
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Data Visualization Application...\n');

// Check if R is installed
const checkR = spawn('Rscript', ['--version']);
checkR.on('error', () => {
  console.warn('⚠️  Warning: R is not installed or not in PATH');
  console.warn('   R features will not be available');
  console.warn('   Install R from: https://www.r-project.org/\n');
});

// Start backend server
console.log('Starting backend server...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  shell: true,
  stdio: 'inherit'
});

// Wait a bit for backend to start
setTimeout(() => {
  console.log('\nStarting frontend server...');
  const frontend = spawn('npm', ['run', 'dev'], {
    shell: true,
    stdio: 'inherit'
  });

  // Handle exit
  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });
}, 3000);

console.log('\nApplication starting...');
console.log('Frontend will be available at: http://localhost:5173');
console.log('Backend API at: http://localhost:3001');
console.log('\nPress Ctrl+C to stop all servers\n'); 