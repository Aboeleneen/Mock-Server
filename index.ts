import express, { Request, Response, Application } from 'express';
import { TransactionRequest, generateTransactionResponse } from './generators/transaction';
import { PayoutsRequest, generatePayouts, generatePayoutsResponse } from './generators/payouts';
import { generateStoresResponse } from './generators/stores';
import { getTaxInvoices } from './generators/taxInvoices';
import { TAX_AVAILABLE_YEARS } from './constants';


const app: Application = express();
app.use(express.json())
const port = process.env.PORT || 8000;

app.post('/transactions', (req: Request, res: Response) => {
    res.json(generateTransactionResponse(req.body as TransactionRequest))
});

app.post('/payouts', (req: Request, res: Response) => {
    res.json(generatePayoutsResponse(req.body as PayoutsRequest))
});

app.post('/tax-invoices', async (req: Request, res: Response) => {
    console.log(req.body)
    res.json(await getTaxInvoices(req.body))
});

app.get('/tax-available-years/:merchantId',  (req: Request, res: Response) => {
    const response = {
        years: TAX_AVAILABLE_YEARS
    };
    res.json(response);
});

app.get('/merchant/:id/stores', (req: Request, res: Response) => {
    res.json(generateStoresResponse(req.headers["X-CounterpartyCode"] as string))
});

app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
});