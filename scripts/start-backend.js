#!/usr/bin/env node

/**
 * Cross-platform script to start the backend server
 * Handles virtual environment activation and dependency checking
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const backendDir = path.join(__dirname, '../../job-hire-backend');
const isWindows = os.platform() === 'win32';
const venvPython = isWindows 
  ? path.join(backendDir, '.venv', 'Scripts', 'python.exe')
  : path.join(backendDir, '.venv', 'bin', 'python');

// Check if virtual environment exists
if (!fs.existsSync(path.join(backendDir, '.venv'))) {
  console.log('⚠️  Virtual environment not found. Please create it first:');
  console.log(`   cd ${backendDir}`);
  console.log(`   ${isWindows ? 'python' : 'python3'} -m venv .venv`);
  console.log(`   ${isWindows ? '.venv\\Scripts\\activate' : 'source .venv/bin/activate'}`);
  console.log('   pip install -r requirements.txt\n');
  process.exit(1);
}

// Check if .env exists
if (!fs.existsSync(path.join(backendDir, '.env'))) {
  console.log('⚠️  .env file not found. Please create one with your configuration.');
  console.log('   You can copy .env.example as a starting point.\n');
}

// Use venv Python if available, otherwise use system Python
const pythonCmd = fs.existsSync(venvPython) ? venvPython : (isWindows ? 'python' : 'python3');

console.log('🚀 Starting backend server on http://localhost:8002');
console.log('📚 API Documentation: http://localhost:8002/docs\n');

const args = ['-m', 'uvicorn', 'api.main:app', '--reload', '--host', '0.0.0.0', '--port', '8002'];

const backendProcess = spawn(pythonCmd, args, {
  cwd: backendDir,
  stdio: 'inherit',
  shell: isWindows
});

backendProcess.on('error', (error) => {
  console.error('❌ Error starting backend:', error.message);
  process.exit(1);
});

backendProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Backend process exited with code ${code}`);
    process.exit(code);
  }
});

