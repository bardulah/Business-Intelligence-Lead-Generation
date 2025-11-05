const express = require('express');
const router = express.Router();
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

// Export leads to CSV
router.post('/csv', async (req, res) => {
  try {
    const { leads } = req.body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ error: 'Array of leads required' });
    }

    // Flatten lead data for CSV
    const flatLeads = leads.map(lead => ({
      name: lead.company?.name || lead.github?.name || 'Unknown',
      domain: lead.company?.domain || lead.metadata?.url || '',
      score: lead.scoring?.totalScore || 0,
      grade: lead.scoring?.grade || '',
      priority: lead.scoring?.priority || '',
      githubStars: lead.github?.stars || 0,
      githubForks: lead.github?.forks || 0,
      industry: lead.company?.industry || '',
      location: lead.company?.location || '',
      emails: lead.contact?.emails?.map(e => e.email).join('; ') || '',
      phones: lead.contact?.phones?.join('; ') || '',
      technologies: lead.technology?.summary?.join('; ') || '',
      description: lead.company?.description || lead.github?.description || '',
      analyzedAt: lead.metadata?.analyzedAt || ''
    }));

    const parser = new Parser();
    const csv = parser.parse(flatLeads);

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=leads.csv');
    res.send(csv);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export leads to JSON
router.post('/json', async (req, res) => {
  try {
    const { leads } = req.body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ error: 'Array of leads required' });
    }

    res.header('Content-Type', 'application/json');
    res.header('Content-Disposition', 'attachment; filename=leads.json');
    res.json(leads);
  } catch (error) {
    console.error('JSON export error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export leads to PDF
router.post('/pdf', async (req, res) => {
  try {
    const { leads } = req.body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ error: 'Array of leads required' });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.header('Content-Type', 'application/pdf');
    res.header('Content-Disposition', 'attachment; filename=leads.pdf');

    doc.pipe(res);

    // Title
    doc.fontSize(24).text('Lead Discovery Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Summary
    doc.fontSize(16).text('Summary', { underline: true });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Total Leads: ${leads.length}`);
    doc.text(`Average Score: ${(leads.reduce((sum, l) => sum + (l.scoring?.totalScore || 0), 0) / leads.length).toFixed(2)}`);
    doc.moveDown(2);

    // Leads
    leads.forEach((lead, index) => {
      if (index > 0) doc.addPage();

      const name = lead.company?.name || lead.github?.name || 'Unknown';
      const score = lead.scoring?.totalScore || 0;
      const grade = lead.scoring?.grade || '';

      doc.fontSize(18).text(`${index + 1}. ${name}`, { underline: true });
      doc.moveDown();

      doc.fontSize(14).fillColor('green').text(`Score: ${score} (${grade})`);
      doc.fillColor('black').fontSize(12);
      doc.moveDown();

      // Company info
      if (lead.company) {
        doc.fontSize(14).text('Company Information:');
        doc.fontSize(11);
        if (lead.company.domain) doc.text(`Domain: ${lead.company.domain}`);
        if (lead.company.industry) doc.text(`Industry: ${lead.company.industry}`);
        if (lead.company.location) doc.text(`Location: ${lead.company.location}`);
        if (lead.company.description) doc.text(`Description: ${lead.company.description}`);
        doc.moveDown();
      }

      // GitHub info
      if (lead.github) {
        doc.fontSize(14).text('GitHub Activity:');
        doc.fontSize(11);
        doc.text(`Repository: ${lead.github.fullName}`);
        doc.text(`Stars: ${lead.github.stars} | Forks: ${lead.github.forks}`);
        doc.moveDown();
      }

      // Contact info
      if (lead.contact && lead.contact.emails && lead.contact.emails.length > 0) {
        doc.fontSize(14).text('Contact Information:');
        doc.fontSize(11);
        lead.contact.emails.slice(0, 3).forEach(e => {
          doc.text(`Email: ${e.email} (${e.type})`);
        });
        doc.moveDown();
      }

      // Scoring reasoning
      if (lead.scoring?.reasoning) {
        doc.fontSize(14).text('Analysis:');
        doc.fontSize(11);
        lead.scoring.reasoning.forEach(reason => {
          doc.text(`• ${reason}`);
        });
      }
    });

    doc.end();
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
