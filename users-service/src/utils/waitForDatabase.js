const { sequelize } = require('../models');

async function waitForDatabase(maxRetries = 30, delay = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await sequelize.authenticate();
      console.log('Database connection established successfully!');
      return true;
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      console.log(`Attempt ${i + 1}/${maxRetries}: Waiting for database to be ready...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

module.exports = { waitForDatabase };

