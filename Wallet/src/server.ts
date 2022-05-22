import App from '@/app';
import validateEnv from '@utils/validateEnv';
import BalanceRoute from './routes/balance.route';
import TransactionsRoute from './routes/transactions.route';

validateEnv();

const app = new App([new TransactionsRoute(), new BalanceRoute()]);

app.listen();
