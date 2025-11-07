import analysisQueue, { AnalysisJobData } from '../config/queue';
import githubScanner from '../services/githubScanner';
import leadScoring from '../services/leadScoring';
import prisma from '../config/database';
import logger from '../utils/logger';
import type { Lead } from '../types';

// Import JS services temporarily (will convert later)
const technologyDetector = require('./technologyDetector');
const contactExtractor = require('./contactExtractor');
const companyResearch = require('./companyResearch');

// Process lead analysis jobs
analysisQueue.process(async (job) => {
  const { userId, github } = job.data as AnalysisJobData;
  let { website } = job.data as AnalysisJobData;

  logger.info(`Processing lead analysis job ${job.id}`, { userId, github, website });

  try {
    const leadData: Partial<Lead> = {
      metadata: {
        analyzedAt: new Date().toISOString(),
        source: github ? 'github' : 'website',
        url: website,
      },
    };

    // Progress: 0% - Started
    await job.progress(0);
    await updateJobProgress(job.id as string, 0, 'Starting analysis');

    // GitHub analysis (25%)
    if (github) {
      logger.info(`Analyzing GitHub: ${github}`);
      await job.progress(10);
      await updateJobProgress(job.id as string, 10, 'Analyzing GitHub repository');

      const [owner, repo] = github.split('/');
      if (owner && repo) {
        try {
          const githubData = await githubScanner.analyzeRepository(owner, repo);
          leadData.github = githubData;

          if (!website && githubData.homepage) {
            website = githubData.homepage;
          }

          if (githubData.owner.type === 'Organization' && githubData.organization) {
            leadData.company = {
              ...leadData.company,
              name: githubData.organization.name,
              email: githubData.organization.email || undefined,
              website: githubData.organization.website || undefined,
              location: githubData.organization.location || undefined,
            } as any;
          }
        } catch (error) {
          logger.error('GitHub analysis failed:', error);
        }
      }
      await job.progress(25);
    }

    // Technology detection (50%)
    if (website) {
      logger.info(`Detecting technology: ${website}`);
      await job.progress(30);
      await updateJobProgress(job.id as string, 30, 'Detecting website technology');

      try {
        const techData = await technologyDetector.detectTechnologies(website);
        leadData.technology = techData;
      } catch (error) {
        logger.error('Technology detection failed:', error);
      }
      await job.progress(50);
    }

    // Contact extraction (70%)
    if (website) {
      logger.info(`Extracting contacts: ${website}`);
      await job.progress(55);
      await updateJobProgress(job.id as string, 55, 'Extracting contact information');

      try {
        const contactData = await contactExtractor.extractContacts(website, {
          github: leadData.github?.organization,
        });
        leadData.contact = contactData;
      } catch (error) {
        logger.error('Contact extraction failed:', error);
      }
      await job.progress(70);
    }

    // Company research (90%)
    if (website) {
      logger.info(`Researching company: ${website}`);
      await job.progress(75);
      await updateJobProgress(job.id as string, 75, 'Researching company profile');

      try {
        const companyData = await companyResearch.researchCompany(website, {
          name: leadData.company?.name,
          location: leadData.company?.location,
          publicRepos: (leadData.company as any)?.publicRepos,
          contributors: leadData.github?.contributors,
        });
        leadData.company = { ...leadData.company, ...companyData } as any;
      } catch (error) {
        logger.error('Company research failed:', error);
      }
      await job.progress(90);
    }

    // Calculate lead score
    logger.info('Calculating lead score');
    await job.progress(95);
    await updateJobProgress(job.id as string, 95, 'Calculating lead score');

    leadData.scoring = leadScoring.calculateLeadScore(leadData);
    leadData.metadata = leadData.metadata || {
      analyzedAt: new Date().toISOString(),
      source: github ? 'github' : 'website',
      url: website,
    };

    // Save to database
    logger.info('Saving lead to database');
    await job.progress(98);

    const savedLead = await prisma.lead.create({
      data: {
        name: leadData.company?.name || leadData.github?.name || 'Unknown Lead',
        domain: leadData.company?.domain || website || null,
        status: 'NEW',
        priority: leadData.scoring.priority === 'high' ? 'HIGH' :
                  leadData.scoring.priority === 'medium' ? 'MEDIUM' :
                  leadData.scoring.priority === 'low' ? 'LOW' : 'VERY_LOW',
        score: leadData.scoring.totalScore,
        grade: leadData.scoring.grade,
        confidence: leadData.scoring.confidence,
        githubData: leadData.github as any,
        companyData: leadData.company as any,
        techData: leadData.technology as any,
        contactData: leadData.contact as any,
        source: leadData.metadata.source,
        userId,
        lastAnalyzedAt: new Date(),
      },
    });

    // Create activity log
    await prisma.leadActivity.create({
      data: {
        type: 'ANALYZED',
        leadId: savedLead.id,
        data: {
          score: leadData.scoring.totalScore,
          grade: leadData.scoring.grade,
        },
      },
    });

    await job.progress(100);
    await updateJobProgress(job.id as string, 100, 'Complete');

    logger.info(`Lead analysis completed for job ${job.id}`);

    return { leadId: savedLead.id, ...leadData };
  } catch (error) {
    logger.error(`Lead analysis failed for job ${job.id}:`, error);
    throw error;
  }
});

async function updateJobProgress(jobId: string, progress: number, _message: string) {
  try {
    await prisma.analysisJob.upsert({
      where: { jobId },
      update: {
        progress,
        status: progress === 100 ? 'COMPLETED' : 'PROCESSING',
        updatedAt: new Date(),
        completedAt: progress === 100 ? new Date() : null,
      },
      create: {
        jobId,
        status: 'PROCESSING',
        type: 'LEAD_ANALYSIS',
        input: {},
        progress,
      },
    });
  } catch (error) {
    logger.error('Failed to update job progress:', error);
  }
}

logger.info('Lead analyzer worker started');

export default analysisQueue;
