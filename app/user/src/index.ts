import app from './app';
import { PORT, HOST } from './config';

async function start() {
  app.listen(PORT, () => {
    console.info(`HTTP server is listening at ${PORT}`);
    console.info(`REST API v1 is available at ${HOST}`);
  });
}

void start();
