import 'reflect-metadata';
import 'express-async-errors';

import express, { NextFunction, Request, Response } from 'express';
import { errors, isCelebrate } from 'celebrate';
import cors from 'cors';
import AppError from '@shared/errors/AppErros';
import routes from './routes';

import '@shared/infra/mongoose';
import '@shared/container';

const app = express();
app.use(errors());
app.use(cors());
app.use(express.json());

app.use(routes);

app.use((err: Error, request: Request, response: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  if (isCelebrate(err)) {
    return response.status(400).json({
      status: 'error',
      message: err.message,
    });
  }

  // eslint-disable-next-line no-console
  console.error(err);

  return response.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

export default app;
