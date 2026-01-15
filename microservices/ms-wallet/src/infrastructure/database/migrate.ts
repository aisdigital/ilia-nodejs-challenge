import { Sequelize } from 'sequelize';
import path from 'path';
import { Umzug, SequelizeStorage } from 'umzug';

export const runMigrations = async (sequelize: Sequelize): Promise<void> => {
    const umzug = new Umzug({
        migrations: {
            glob: path.join(__dirname, 'migrations/*.js'),
        },
        context: sequelize.getQueryInterface(),
        storage: new SequelizeStorage({ sequelize }),
        logger: console,
    });

    await umzug.up();
};
