# microservice users project

## Starting the application

For create an external network with Docker.

```bash
docker network create services
```

For install dependencies you run:

```bash
docker-compose run --rm node npm i
```

To start the project, install the dependencies and run

```bash
docker-compose up
```

## Knex cli commands

We provide the following knex commands.

```bash
docker-compose run --rm node npm run ts-knex # for typescript

```

These commands accept the same options as knex commands, for example:

```bash
    docker-compose run --rm node npm run ts-knex -- --knexfile=src/database/knexfile.ts migrate:make -x ts migration-name # Create a migration in typescript

    docker-compose run --rm node npm run ts-knex -- --knexfile=src/database/knexfile.ts seed:make -x ts seed-name # Create a seed in typescript

    docker-compose run --rm node npm run ts-knex -- --knexfile=src/database/knexfile.ts migrate:latest # Run all migrations in typescript

    docker-compose run --rm node npm run ts-knex -- --knexfile=src/database/knexfile.ts migrate:rollback # Rollback a single migration in typescript

    docker-compose run --rm node npm run ts-knex -- --knexfile=src/database/knexfile.ts seed:run # Run all seeds in typescript
```

## Running eslint

```bash
docker-compose run --rm node npm run lint