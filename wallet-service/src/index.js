require('dotenv').config();
const app = require('./app');
const db = require('./database');
const { runMigrations } = require('./utils/runMigrations');
const { waitForDatabase } = require('./utils/waitForDatabase');

const PORT = process.env.PORT || 3001;

// Initialize database and start server
async function startServer() {
  try {
    // Wait for database to be ready
    await waitForDatabase();
    
    // Connect to database
    await db.initializeDatabase();
    
    // Run migrations
    await runMigrations();
    
    console.log('Database initialized and migrations executed successfully');

    app.listen(PORT, () => {
      console.log(`Wallet Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
