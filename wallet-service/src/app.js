const express = require('express');
const cors = require('cors');
const internalRoutes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());

// Internal routes (service-to-service communication)
app.use('/', internalRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;

