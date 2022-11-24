import express, { Request, Response } from "express"
import router from './routes/routes';

const app = express();
app.use(express.json());
app.use(router);

app.get("/", (req: Request, res: Response) => {
    return res.json({ status: "success" });
});

app.listen(3001, () => console.log('Listening on port 3001'));