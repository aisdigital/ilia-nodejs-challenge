# ília - Code Challenge NodeJS

## System Requirements

- Docker
- Node.js (version 16 or later)
- Yarn

## Installation

1. **Install Docker:**
   - Follow the instructions at [Get Docker](https://docs.docker.com/get-docker/).

2. **Install Node.js:**
   - Node.js can be downloaded from [Node.js official website](https://nodejs.org/en/download/).

3. **Install Yarn:**
   - Instructions for Yarn installation can be found on the [Yarn official website](https://yarnpkg.com/lang/en/docs/install/).

## Running the Application

A `Makefile` is included to streamline the process of managing the microservice lifecycle and database operations. Below are the steps to build, run, and stop the application:

### Starting the Services

To build and start the microservices in detached mode, run:

```bash
make up
```

### Run Database Migrations

Once the services are up and running, you'll need to execute the database migrations for both the wallet and user microservices. Use the following commands:

```bash
make migrate
```

### Stop and Remove Containers

To stop the services and remove all containers, use the following command:

```bash
make down
```
