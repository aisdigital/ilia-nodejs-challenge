import App from '@/app';
import validateEnv from '@utils/validateEnv';
import TransactionsRoute from './routes/transactions.route';

validateEnv();

const app = new App([new TransactionsRoute()]);

app.listen();
