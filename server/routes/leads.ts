import { Router } from 'express';
import { AuthRequest, authenticate } from '../middleware/auth';
// import { analysisLimiter } from '../middleware/rateLimiter'; // temporarily disabled
import { validateSchema, AnalysisRequestSchema } from '../utils/validation';
import analysisQueue from '../config/queue';
import prisma from '../config/database';
import logger from '../utils/logger';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Analyze a lead (async with job queue)
router.post('/analyze', /* analysisLimiter, */ async (req: AuthRequest, res, next) => {
  try {
    const data = validateSchema(AnalysisRequestSchema, req.body);
    const userId = req.user!.userId;

    // Create job
    const job = await analysisQueue.add('analyze-lead', {
      userId,
      github: data.github,
      website: data.website,
    });

    // Create job record in database
    await prisma.analysisJob.create({
      data: {
        jobId: job.id as string,
        status: 'PENDING',
        type: 'LEAD_ANALYSIS',
        input: data as any,
        progress: 0,
      },
    });

    logger.info(`Lead analysis job created: ${job.id}`, { userId, ...data });

    res.status(202).json({
      jobId: job.id,
      status: 'pending',
      message: 'Analysis started. Use /api/leads/job/:jobId to check progress',
    });
  } catch (error) {
    next(error);
  }
});

// Get job status
router.get('/job/:jobId', async (req: AuthRequest, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await analysisQueue.getJob(jobId);

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const state = await job.getState();
    const progress = job.progress();
    const result = job.returnvalue;
    const failedReason = job.failedReason;

    res.json({
      jobId,
      status: state,
      progress,
      result,
      error: failedReason,
    });
  } catch (error) {
    next(error);
  }
});

// Get all leads for user
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const { page = 1, limit = 20, status, priority, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          activities: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    res.json({
      data: leads,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single lead
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const lead = await prisma.lead.findFirst({
      where: { id, userId },
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    res.json(lead);
  } catch (error) {
    next(error);
  }
});

// Update lead
router.patch('/:id', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { status, notes, tags } = req.body;

    const lead = await prisma.lead.findFirst({
      where: { id, userId },
    });

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        status: status || lead.status,
        notes: notes !== undefined ? notes : lead.notes,
        tags: tags || lead.tags,
        updatedAt: new Date(),
      },
    });

    // Log activity
    await prisma.leadActivity.create({
      data: {
        type: 'UPDATED',
        leadId: id,
        data: { changes: { status, notes, tags } },
      },
    });

    logger.info(`Lead updated: ${id}`, { userId });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Delete lead
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const lead = await prisma.lead.findFirst({
      where: { id, userId },
    });

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    await prisma.lead.delete({
      where: { id },
    });

    logger.info(`Lead deleted: ${id}`, { userId });

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get lead statistics
router.get('/stats/summary', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.userId;

    const [total, byStatus, byPriority, avgScore] = await Promise.all([
      prisma.lead.count({ where: { userId } }),
      prisma.lead.groupBy({
        by: ['status'],
        where: { userId },
        _count: true,
      }),
      prisma.lead.groupBy({
        by: ['priority'],
        where: { userId },
        _count: true,
      }),
      prisma.lead.aggregate({
        where: { userId },
        _avg: { score: true },
      }),
    ]);

    res.json({
      total,
      byStatus,
      byPriority,
      averageScore: avgScore._avg.score || 0,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
