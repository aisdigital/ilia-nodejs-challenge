import 'express-async-errors';
import cors from 'cors';
import express from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { router } from './routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', async (_req, res) => {
  res.status(StatusCodes.OK).send(ReasonPhrases.OK);
});

app.use('/', router);

export default app;
