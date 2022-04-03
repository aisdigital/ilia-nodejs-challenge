import express from 'express';
import helmet from 'helmet';
import passport from 'passport';
import { config } from 'dotenv';
import cors from 'cors';

if (process.env.NODE_ENV === 'local') {
  config();
}

import { usePassport } from './utils/passport-helper';
import routes from './modules/routes';
import database from './database/mongoose';
import morgan from 'morgan';
import { errorHandlerMiddleware } from './utils/error';

const app = express();

database();

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

usePassport();

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use(routes);

routes.get('/', (_req, res) => {
  return res.send('<h1>Wallet Up!</h1>');
});

app.use(errorHandlerMiddleware);

const port = process.env.PORT ?? 3001;
app.listen(port, () => {
  console.log('Server Local On:', port);
});

export default app;
