import express from 'express';
const app = express();
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'Wallet 3001 OK' }));
app.get('/health', (req, res) => res.json({ uptime: process.uptime() }));

app.listen(3001, () => {
  console.log('Wallet listening on 3001');
});
