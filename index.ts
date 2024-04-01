import express, { Request, Response, Application } from 'express';
import { TransactionRequest, generateTransactionResponse } from './generators/transaction';
import { PayoutsRequest, PayoutsSummaryRequest, generatePayoutsResponse, generatePayoutsSummaryResponse } from './generators/payouts';
import { generateStoresResponse } from './generators/stores';
import { getTaxInvoices } from './generators/taxInvoices';
import { TAX_AVAILABLE_YEARS } from './constants';
import { getMonthlyStatementReports } from './generators/monthlyStatementReports';
import { generateTransactionDayMetrics, generateTransactionMetrics } from './generators/metrics';


const app: Application = express();
app.use(express.json())
const port = process.env.PORT || 8000;

app.post('/getTransaction', async (req: Request, res: Response) => {
    res.json(await generateTransactionResponse(req.body as TransactionRequest))
});

app.post('/getPayout', async (req: Request, res: Response) => {
    res.json(await generatePayoutsResponse(req.body as PayoutsRequest))
});

app.post('/payoutsSummary', async (req: Request, res: Response) => {
    res.json(await generatePayoutsSummaryResponse(req.body as PayoutsSummaryRequest));
})

app.post(['/getVatSummary', 'tax-invoices'], async (req: Request, res: Response) => {
    res.json(await getTaxInvoices(req.body));
});

app.post(["/getMsrSummary", 'monthly-statement-reports'], async (req: Request, res: Response) => {
    res.json(await getMonthlyStatementReports(req.body));
})
app.get('/tax-available-years/:merchantId', (req: Request, res: Response) => {
    const response = {
        years: TAX_AVAILABLE_YEARS
    };
    res.json(response);
});

app.get('/api/v1/user/:id/entities', async (req: Request, res: Response) => {
    res.json(await generateStoresResponse())
});

app.post('/getChart', async (req: Request, res: Response) => {
    res.json(await generateTransactionMetrics(req.body as MetricsRequest));
});

app.post('/transactionsMetrics', async (req: Request, res: Response) => {
    res.json(await generateTransactionMetrics(req.body as MetricsRequest));
});

app.post('/getDayGraph', async (req: Request, res: Response) => {
    res.json(await generateTransactionDayMetrics(req.body as MetricsRequest));
});

app.post('/generateToken', (req: Request, res: Response) => {
    res.json({
        access_token: "dfksaohui23elnccs23",
        expires_in: 23453,
    });
});

app.get('/transactionContent', (req, res) => {
    // Sample CMS transaction response
    const cmsTransactionResponse = {
        Id: "1",
        ContentType: "Some Content Type",
        Name: "Some Name",
        CreateDate: "2024-02-25",
        UpdateDate: "2024-02-25",
        Properties: {
            ReferenceIdCol: "New Reference ID",
            TerminalIdCol: "Terminal ID",
            SchemeCol: "Scheme",
            AmountCol: "Amount",
            TagsCol: "Tags",
            TypeCol: "Type",
            StatusCol: "Status",
            PayoutIdCol: "Payout ID",
            StoreCol: "Store",
            NetAmountCol: "Net amount",
            ExchangeRateCol: "Exchange rate",
            OriginalAmountCol: "Original amount",
            FilterByText: "Filter by2",
            PaymentMethodText: "Payment method"
            // Include other properties from CmsTransactionProperties as needed
        }
    };

    // Return the CMS transaction response as JSON
    res.json(cmsTransactionResponse);
});

app.get('/payoutContent', (req, res) => {
    // Sample CMS payout response
    const cmsPayoutResponse = {
        Id: "1",
        ContentType: "Some Content Type",
        Name: "Some Name",
        CreateDate: "2024-02-25",
        UpdateDate: "2024-02-25",
        Properties: {
            PayoutIdCol: "Payout ID",
            IbanCol: "IBAN",
            NumberOfTransactionsCol: "Number of transactions",
            NetPayoutCol: "Net payout",
            StatusCol: "Status",
            GrossAmountCol: "Gross amount",
            NetAmountCol: "Net amount2",
            FeesDeductedCol: "Fees deducted",
            RefundAndChargebackCol: "Refund and chargeback",
            FilterByText: "Filter by",
            PaymentMethodText: "Payment method2"
            // Include other properties from CmsPayoutProperties as needed
        }
    };

    // Return the CMS payout response as JSON
    res.json(cmsPayoutResponse);
});

app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
});