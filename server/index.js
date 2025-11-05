const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const leadRoutes = require('./routes/leads');
const githubRoutes = require('./routes/github');
const techRoutes = require('./routes/technology');
const contactRoutes = require('./routes/contacts');
const exportRoutes = require('./routes/export');

app.use('/api/leads', leadRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/technology', techRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/export', exportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Lead Discovery Server running on port ${PORT}`);
});
