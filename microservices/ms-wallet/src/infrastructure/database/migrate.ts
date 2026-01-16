import { Sequelize } from 'sequelize';
import path from 'path';
import { Umzug, SequelizeStorage } from 'umzug';

export const runMigrations = async (sequelize: Sequelize): Promise<void> => {
  const migrationsPath = path.join(
    __dirname,
    '../../../src/infrastructure/database/migrations/*.js'
  );

  const umzug = new Umzug({
    migrations: {
      glob: migrationsPath,
      resolve: ({ name, path: filepath }) => ({
        name,
        up: async () => {
          const migration = await import(filepath!);
          return migration.up(sequelize.getQueryInterface(), sequelize.constructor);
        },
        down: async () => {
          const migration = await import(filepath!);
          return migration.down?.(sequelize.getQueryInterface(), sequelize.constructor);
        },
      }),
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
  });

  await umzug.up();
};
