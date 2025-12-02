const sequelize = require('../config/config');

// Verify database connection
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
}

module.exports = {
  sequelize,
  initializeDatabase,
};

