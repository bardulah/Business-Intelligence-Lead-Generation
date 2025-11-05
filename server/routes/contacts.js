const express = require('express');
const router = express.Router();
const contactExtractor = require('../services/contactExtractor');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 3600 });

// Extract contacts from a website
router.post('/extract', async (req, res) => {
  try {
    const { url, additionalSources } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL required' });
    }

    const cacheKey = `contact_${url}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const result = await contactExtractor.extractContacts(url, additionalSources);
    cache.set(cacheKey, result);

    res.json(result);
  } catch (error) {
    console.error('Contact extraction error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
