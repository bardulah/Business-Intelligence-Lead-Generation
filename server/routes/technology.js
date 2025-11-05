const express = require('express');
const router = express.Router();
const technologyDetector = require('../services/technologyDetector');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 3600 });

// Detect technologies for a website
router.post('/detect', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL required' });
    }

    const cacheKey = `tech_${url}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const result = await technologyDetector.detectTechnologies(url);
    cache.set(cacheKey, result);

    res.json(result);
  } catch (error) {
    console.error('Technology detection error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
