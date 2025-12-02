const express = require('express');
const cors = require('cors');
const internalRoutes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());

// Internal routes (service-to-service communication)
app.use('/', internalRoutes);

// Error handler for JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON format' });
  }
  
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;

