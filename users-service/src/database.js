const { initializeDatabase } = require('./models');

// Maintain compatibility with old code that uses db.query
// But now using Sequelize
const { sequelize } = require('./models');

module.exports = {
  initializeDatabase,
  sequelize,
  // Keep query for temporary compatibility (will be removed after complete migration)
  query: async (text, params) => {
    const [results] = await sequelize.query(text, { bind: params });
    return { rows: results };
  },
};

