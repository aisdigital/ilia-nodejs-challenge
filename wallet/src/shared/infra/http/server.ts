import express from 'express';

import '@shared/infra/mongoose';

const app = express();

app.listen(3001,()=>{
  console.log("Server started. Port 3001")
});