import * as dotenv from 'dotenv';
import express from 'express';
import routes from './routes';

dotenv.config({ path: __dirname+'/../.env' })

const app = express();

app.use(express.json());

app.use('/', routes);

const port = process.env.PORT || 3001;

app.listen(port, () => console.log(`Microsservice transactions running on port ${port}`));