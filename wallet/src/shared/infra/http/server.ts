import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import cors from 'cors';
import AppError from '@shared/errors/AppErros';

import '@shared/infra/mongoose';
import AppError from '@shared/erros/AppErros';

const app = express();
app.use(cors());
app.use(express.json());

app.use((err: Error, request: Request, response: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }
  console.error(err);

  return response.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

app.listen(3001, () => {
  // eslint-disable-next-line no-console
  console.log('Server started. Port 3001');
});
