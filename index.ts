import express, { Request, Response, Application } from 'express';
import { generateStoresResponse } from './generators/stores';
import { getTaxInvoices } from './generators/taxInvoices';
import { TAX_AVAILABLE_YEARS } from './constants';
import { getMonthlyStatementReports } from './generators/monthlyStatementReports';
import { generateTransactionDayMetrics, generateTransactionMetrics } from './generators/metrics';
import { MetricsRequest } from './interfaces/metrics';
import { generateTransactionResponse } from './generators/transaction';
import { generatePayoutsResponse, generatePayoutsSummaryResponse } from './generators/payouts';
import { PayoutsRequest, PayoutsSummaryRequest } from './interfaces/payout';
import { TransactionRequest } from './interfaces/transaction';
import { createNewTicket, getStoreTerminals, getTicketsList } from './generators/tickets'; // Assuming this is the correct import for getTicketsList
import { CreateNewTicketRequest, TicketsQueryRequest } from './interfaces/tickets';

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

app.post('/getVatSummary', async (req: Request, res: Response) => {
    res.json(await getTaxInvoices(req.body));
});

app.post('/tax-invoices', async (req: Request, res: Response) => {
    res.json(await getTaxInvoices(req.body));
});

app.post("/getMsrSummary", async (req: Request, res: Response) => {
    res.json(await getMonthlyStatementReports(req.body));
})

app.post('/monthly-statement-reports', async (req: Request, res: Response) => {
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

// Epos Api Requests Simulation
app.post('/Auth/Login', async (req: Request, res: Response) => {
    res.json({
        output: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.adfasfdskdlfj.iMn27pi-"
    });
});

app.post('/Maintenance/TicketStatus', async (req: Request, res: Response) => {
    const ticketsResponse = getTicketsList(req.body as TicketsQueryRequest);
    res.json(ticketsResponse);
});

app.get('/Maintenance/GetMerchantDetails', async (req: Request, res: Response) => {
    const { identifierType, identifierValue  } = req.query;
    // Simulate fetching merchant details based on identifierType and identifierValue
    res.json({
        "errorCode": "EIPAD1000",
        "errorDescription": "Success",
        "status": true,
        "merchantDetails": getStoreTerminals(identifierValue as string)
    });
});

app.post('/Maintenance/TicketCreation', async (req: Request, res: Response) => {
    const ticketId = createNewTicket(req.body as CreateNewTicketRequest);
    res.json({
        "errorCode": "EIPAD1000",
        "errorDescription": "Success(None)",
        "ticketId": ticketId,
        "status": true
    });
});

app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
});