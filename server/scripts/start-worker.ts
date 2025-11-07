#!/usr/bin/env ts-node

/**
 * Start the background job worker
 * This processes lead analysis jobs from the queue
 */

import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import logger from '../utils/logger';

// Load environment
dotenv.config();

// Import worker (this starts processing)
import '../workers/leadAnalyzer';

async function startWorker() {
  try {
    logger.info('Starting Lead Analyzer Worker...');

    // Connect to database
    await connectDatabase();

    logger.info('✓ Worker started and ready to process jobs');
    logger.info('  Press Ctrl+C to stop');

    // Keep process alive
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error('Failed to start worker:', error);
    process.exit(1);
  }
}

function shutdown() {
  logger.info('Shutting down worker...');
  process.exit(0);
}

startWorker();
