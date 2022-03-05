import express from 'express';
import cors from 'cors';

import '@shared/infra/mongoose';

const app = express();
app.use(cors());
app.use(express.json());

app.listen(3001,()=>{
  console.log("Server started. Port 3001")
});