import Queue from 'bull';
import logger from '../utils/logger';
import redis from './redis';

export const analysisQueue = new Queue('lead-analysis', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 500, // Keep last 500 failed jobs
  },
});

analysisQueue.on('error', (error) => {
  logger.error('Queue error:', error);
});

analysisQueue.on('failed', (job, error) => {
  logger.error(`Job ${job.id} failed:`, error);
});

analysisQueue.on('completed', (job) => {
  logger.info(`Job ${job.id} completed`);
});

analysisQueue.on('stalled', (job) => {
  logger.warn(`Job ${job.id} stalled`);
});

export interface AnalysisJobData {
  userId: string;
  github?: string;
  website?: string;
}

export interface AnalysisJobProgress {
  stage: string;
  percent: number;
  message?: string;
}

export default analysisQueue;
