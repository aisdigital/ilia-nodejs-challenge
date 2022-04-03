### Before committing

run `npm run prepare` or `yarn prepare`

## For running locally

Run the commands below and enter them in the services you want to run

`cd wallet`

Install packages

`npm i` or `yarn`

### Start the dev server

`npm run local` or `yarn local`

### Build the project

`npm run build` or `yarn build`

### Start built project

`npm start` or `yarn start`

## For running Docker Containers

_You'll need docker installed on your machine to run this in case you didn't know!_

### Build the image

`docker-compose build`

### Start the dev server

`make up`

### Stop the server

`make down`

### Build and start production build

`make up-prod`
