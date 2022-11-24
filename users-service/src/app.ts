import express, { Request, Response } from "express"
import router from './routes/router';

const app = express();
app.use(express.json());
app.use(router);

app.get("/", (req: Request, res: Response) => {
    return res.json({ status: "success" });
});

app.listen(3002, () => console.log('Listening on port 3002'));