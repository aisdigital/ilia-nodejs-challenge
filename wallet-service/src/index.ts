import express, { Request, Response } from "express"
import knex from "./db/knex";

const app = express();

app.get("/", (req: Request, res: Response) => {
    return res.json({
        status: "success"
    });
});

app.listen(3001, () => console.log('Listening on port 3001'));