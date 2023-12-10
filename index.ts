import express, { Request, Response, Application } from 'express';
import { TransactionRequest, generateTransactionResponse, generateTransactions } from './generators/transaction';
import { PayoutsRequest, PayoutsSummaryRequest, generatePayouts, generatePayoutsResponse, generatePayoutsSummaryResponse } from './generators/payouts';
import { generateStores, generateStoresResponse } from './generators/stores';
import { getTaxInvoices } from './generators/taxInvoices';
import { TAX_AVAILABLE_YEARS } from './constants';
import { MetricsRequest, generateTransactionMetrics } from './generators/metrics';
import { getMonthlyStatementReports } from './generators/monthlyStatementReports';


const app: Application = express();
app.use(express.json())
const port = process.env.PORT || 8000;

app.post('/transactions', async (req: Request, res: Response) => {
    res.json(await generateTransactionResponse(req.body as TransactionRequest))
});

app.post('/payouts', async (req: Request, res: Response) => {
    res.json(await generatePayoutsResponse(req.body as PayoutsRequest))
});

app.post('/payoutsSummary', async (req: Request, res: Response) => {
    res.json(await generatePayoutsSummaryResponse(req.body as PayoutsSummaryRequest));
})

app.post('/tax-invoices', async (req: Request, res: Response) => {
    res.json(await getTaxInvoices(req.body));
});

app.post("/monthly-statement-reports", async (req: Request, res: Response) => {
    res.json(await getMonthlyStatementReports(req.body));
})
app.get('/tax-available-years/:merchantId', (req: Request, res: Response) => {
    const response = {
        years: TAX_AVAILABLE_YEARS
    };
    res.json(response);
});

app.get('/merchant/:id/stores', async (req: Request, res: Response) => {
    res.json(await generateStoresResponse())
});

app.post('/transactionsMetrics', async (req: Request, res: Response) => {
    res.json(await generateTransactionMetrics(req.body as MetricsRequest));
});

app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
});