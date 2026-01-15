const { runMigrations } = require('./migrate');
const { sequelize } = require('./sequelize');

async function run() {
    try {
        console.log('Running database migrations...');
        await runMigrations(sequelize);
        console.log('Migrations completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

run();
