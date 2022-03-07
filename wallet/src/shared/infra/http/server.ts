import 'dotenv/config';
import swaggerUi from 'swagger-ui-express';
import app from './app';
import swaggerDoc from '../../../swagger.json';

const port = process.env.PORT || 3001;
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server started. Port ${port}`);
});
