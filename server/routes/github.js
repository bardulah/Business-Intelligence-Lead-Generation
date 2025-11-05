const express = require('express');
const router = express.Router();
const githubScanner = require('../services/githubScanner');

// Search repositories
router.get('/search', async (req, res) => {
  try {
    const { q, sort, order, limit } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const results = await githubScanner.searchRepositories(q, {
      sort,
      order,
      limit: parseInt(limit) || 30
    });

    res.json({ query: q, count: results.length, results });
  } catch (error) {
    console.error('GitHub search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get repository details
router.get('/repo/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await githubScanner.analyzeRepository(owner, repo);
    res.json(result);
  } catch (error) {
    console.error('GitHub repo error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get organization info
router.get('/org/:org', async (req, res) => {
  try {
    const { org } = req.params;
    const result = await githubScanner.getOrganizationInfo(org);
    res.json(result);
  } catch (error) {
    console.error('GitHub org error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
