#!/usr/bin/env ts-node

/**
 * Setup script for Lead Discovery Tool
 * Run this after installing dependencies and setting up environment
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';

const execAsync = promisify(exec);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step: number, message: string) {
  log(`\n[${step}/7] ${message}`, 'cyan');
}

function logSuccess(message: string) {
  log(`✓ ${message}`, 'green');
}

function logError(message: string) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message: string) {
  log(`⚠ ${message}`, 'yellow');
}

async function checkFile(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function runCommand(command: string, description: string): Promise<boolean> {
  try {
    log(`  Running: ${command}...`);
    const { stdout, stderr } = await execAsync(command);
    if (stdout) log(`  ${stdout.trim()}`);
    if (stderr) logWarning(`  ${stderr.trim()}`);
    logSuccess(description);
    return true;
  } catch (error: any) {
    logError(`${description} failed: ${error.message}`);
    return false;
  }
}

async function main() {
  log('\n╔═══════════════════════════════════════════════════════╗', 'bright');
  log('║   Lead Discovery Tool - Setup Script                 ║', 'bright');
  log('║   Version 2.0 - Production Ready                     ║', 'bright');
  log('╚═══════════════════════════════════════════════════════╝\n', 'bright');

  // Step 1: Check environment file
  logStep(1, 'Checking environment configuration');
  const envExists = await checkFile('.env');
  if (!envExists) {
    logWarning('.env file not found');
    log('  Creating .env from .env.example...');
    try {
      await fs.promises.copyFile('.env.example', '.env');
      logSuccess('.env file created');
      logWarning('Please update .env with your actual configuration!');
    } catch (error) {
      logError('Failed to create .env file');
      log('\n  Please copy .env.example to .env and configure it manually.\n');
    }
  } else {
    logSuccess('.env file exists');
  }

  // Step 2: Check Docker services
  logStep(2, 'Checking Docker services');
  try {
    const { stdout } = await execAsync('docker ps --format "{{.Names}}"');
    const containers = stdout.split('\n').filter(Boolean);

    const hasPostgres = containers.some(c => c.includes('postgres'));
    const hasRedis = containers.some(c => c.includes('redis'));

    if (hasPostgres && hasRedis) {
      logSuccess('PostgreSQL and Redis are running');
    } else {
      logWarning('Docker services not running');
      log('\n  Starting Docker Compose...\n');
      await runCommand('docker-compose up -d postgres redis', 'Docker services started');
      log('\n  Waiting for services to be healthy...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  } catch (error) {
    logWarning('Docker not available or not running');
    log('\n  You can start services with: npm run docker:up\n');
  }

  // Step 3: Generate Prisma Client
  logStep(3, 'Generating Prisma Client');
  await runCommand('npx prisma generate', 'Prisma Client generated');

  // Step 4: Run database migrations
  logStep(4, 'Running database migrations');
  const migrated = await runCommand('npx prisma migrate deploy', 'Database migrations applied');

  if (!migrated) {
    logWarning('Migrations failed. Trying to create and migrate...');
    await runCommand('npx prisma migrate dev --name init', 'Database created and migrated');
  }

  // Step 5: Create logs directory
  logStep(5, 'Setting up logs directory');
  try {
    await fs.promises.mkdir('logs', { recursive: true });
    logSuccess('Logs directory created');
  } catch (error) {
    logWarning('Logs directory already exists or could not be created');
  }

  // Step 6: Build TypeScript
  logStep(6, 'Building TypeScript');
  await runCommand('npm run server:build', 'Server built successfully');

  // Step 7: Summary
  logStep(7, 'Setup Summary');

  log('\n╔═══════════════════════════════════════════════════════╗', 'green');
  log('║              Setup Complete! 🎉                       ║', 'green');
  log('╚═══════════════════════════════════════════════════════╝\n', 'green');

  log('\n📋 Next Steps:\n', 'bright');
  log('  1. Update your .env file with actual values:');
  log('     - DATABASE_URL (if not using Docker)');
  log('     - GITHUB_TOKEN (for higher API rate limits)');
  log('     - JWT_SECRET (generate a secure random string)');
  log('');
  log('  2. Start the application:');
  log('     npm run dev           # Development mode');
  log('     npm start             # Production mode');
  log('');
  log('  3. Optional - View your database:');
  log('     npm run prisma:studio');
  log('');
  log('  4. Access the application:');
  log('     Frontend: http://localhost:3000');
  log('     Backend:  http://localhost:3001');
  log('     Health:   http://localhost:3001/health');
  log('');

  log('💡 Useful commands:\n', 'bright');
  log('  npm run docker:up        # Start Docker services');
  log('  npm run docker:down      # Stop Docker services');
  log('  npm run prisma:studio    # Open database GUI');
  log('  npm test                 # Run tests');
  log('  npm run lint             # Lint code');
  log('');

  log('📚 Documentation:', 'bright');
  log('  - README.md for general information');
  log('  - IMPROVEMENTS.md for what changed in v2.0');
  log('');

  log('🚀 Happy lead hunting!\n', 'bright');
}

main().catch((error) => {
  logError(`Setup failed: ${error.message}`);
  process.exit(1);
});
