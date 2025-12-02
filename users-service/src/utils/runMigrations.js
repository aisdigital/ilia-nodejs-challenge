const { Sequelize } = require('sequelize');
const { Umzug, SequelizeStorage } = require('umzug');
const path = require('path');
const sequelize = require('../config/config');

async function runMigrations() {
  try {
    console.log('Running users-service migrations...');

    const umzug = new Umzug({
      migrations: {
        glob: path.join(__dirname, '../migrations/*.js'),
        resolve: ({ name, path: migrationPath, context }) => {
          const migration = require(migrationPath);
          return {
            name,
            up: async () => migration.up(context, Sequelize),
            down: async () => migration.down(context, Sequelize),
          };
        },
      },
      context: sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ sequelize }),
      logger: console,
    });

    await umzug.up();
    console.log('Users-service migrations executed successfully!');
  } catch (error) {
    console.error('Error running users-service migrations:', error);
    throw error;
  }
}

module.exports = { runMigrations };

