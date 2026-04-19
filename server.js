const express = require('express');
const path = require('path');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// API Handlers
// For contact.js (CommonJS)
const contactHandler = require('./api/contact.js');
app.all('/api/contact', async (req, res) => {
  try {
    await contactHandler(req, res);
  } catch (err) {
    console.error('Contact API Error:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
});

// For health.js (CommonJS)
const healthHandler = require('./api/health.js');
app.get('/api/health', (req, res) => {
  healthHandler(req, res);
});

// For chat.js (CommonJS)
const chatHandler = require('./api/chat.js');
app.post('/api/chat', async (req, res) => {
  try {
    await chatHandler(req, res);
  } catch (err) {
    console.error('Chat error:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
});

// Root route handler - serves index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fallback route - if no other routes match, serve index.html (for SPA)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Export for Vercel serverless — DO NOT use app.listen() on Vercel
// app.listen() is only for local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Running locally at http://localhost:${port}`);
  });
}

module.exports = app;