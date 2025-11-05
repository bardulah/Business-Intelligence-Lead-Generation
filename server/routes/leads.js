const express = require('express');
const router = express.Router();
const githubScanner = require('../services/githubScanner');
const technologyDetector = require('../services/technologyDetector');
const contactExtractor = require('../services/contactExtractor');
const companyResearch = require('../services/companyResearch');
const leadScoring = require('../services/leadScoring');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

// Comprehensive lead analysis
router.post('/analyze', async (req, res) => {
  try {
    const { github, website } = req.body;

    if (!github && !website) {
      return res.status(400).json({ error: 'Either GitHub or website URL required' });
    }

    const cacheKey = `lead_${github || website}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const leadData = {};

    // GitHub analysis
    if (github) {
      const [owner, repo] = github.split('/');
      if (owner && repo) {
        try {
          const githubData = await githubScanner.analyzeRepository(owner, repo);
          leadData.github = githubData;

          // Use GitHub homepage for website if not provided
          if (!website && githubData.homepage) {
            website = githubData.homepage;
          }

          // Get org info if available
          if (githubData.owner.type === 'Organization') {
            leadData.company = githubData.organization;
          }
        } catch (error) {
          leadData.github = null;
          leadData.githubError = error.message;
        }
      }
    }

    // Website analysis
    if (website) {
      try {
        // Technology detection
        const techData = await technologyDetector.detectTechnologies(website);
        leadData.technology = techData;

        // Contact extraction
        const contactData = await contactExtractor.extractContacts(website, {
          github: leadData.github?.organization
        });
        leadData.contact = contactData;

        // Company research
        const companyData = await companyResearch.researchCompany(website, {
          name: leadData.company?.name,
          location: leadData.company?.location,
          publicRepos: leadData.company?.publicRepos,
          contributors: leadData.github?.contributors
        });
        leadData.company = { ...leadData.company, ...companyData };
      } catch (error) {
        console.error('Website analysis error:', error.message);
      }
    }

    // Calculate lead score
    leadData.scoring = leadScoring.calculateLeadScore(leadData);

    // Add metadata
    leadData.metadata = {
      analyzedAt: new Date().toISOString(),
      source: github ? 'github' : 'website',
      url: website || leadData.github?.url
    };

    cache.set(cacheKey, leadData);
    res.json(leadData);
  } catch (error) {
    console.error('Lead analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Batch lead analysis
router.post('/analyze-batch', async (req, res) => {
  try {
    const { leads } = req.body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ error: 'Array of leads required' });
    }

    const results = [];
    const errors = [];

    for (const lead of leads.slice(0, 10)) { // Limit to 10 at a time
      try {
        const { github, website } = lead;
        const cacheKey = `lead_${github || website}`;
        let leadData = cache.get(cacheKey);

        if (!leadData) {
          // Simplified analysis for batch
          leadData = { metadata: { source: github ? 'github' : 'website' } };

          if (github) {
            const [owner, repo] = github.split('/');
            if (owner && repo) {
              leadData.github = await githubScanner.analyzeRepository(owner, repo);
            }
          }

          if (website) {
            leadData.technology = await technologyDetector.detectTechnologies(website);
          }

          leadData.scoring = leadScoring.calculateLeadScore(leadData);
          cache.set(cacheKey, leadData);
        }

        results.push(leadData);
      } catch (error) {
        errors.push({ lead, error: error.message });
      }
    }

    // Sort by score
    results.sort((a, b) => b.scoring.totalScore - a.scoring.totalScore);

    res.json({ results, errors });
  } catch (error) {
    console.error('Batch analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get lead score only
router.post('/score', async (req, res) => {
  try {
    const leadData = req.body;
    const scoring = leadScoring.calculateLeadScore(leadData);
    res.json(scoring);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Categorize leads
router.post('/categorize', async (req, res) => {
  try {
    const { leads } = req.body;
    const categorized = leadScoring.categorizeLeads(leads);
    res.json(categorized);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
