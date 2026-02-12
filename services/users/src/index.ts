import express from 'express';
const app = express();
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'Users 3002 OK' }));
app.get('/health', (req, res) => res.json({ uptime: process.uptime() }));

app.listen(3002, () => {
  console.log('Users listening on 3002');
});
