import express, { Request, Response, Application } from 'express';
import { TransactionRequest, generateTransactionResponse } from './generators/transaction';
import { PayoutsRequest, generatePayouts, generatePayoutsResponse } from './generators/payouts';


const app: Application = express();
app.use(express.json())
const port = process.env.PORT || 8000;

app.post('/transactions', (req: Request, res: Response) => {
    res.json(generateTransactionResponse(req.body as TransactionRequest))
});

app.post('/payouts', (req: Request, res: Response) => {
    res.json(generatePayoutsResponse(req.body as PayoutsRequest))
});

app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
});