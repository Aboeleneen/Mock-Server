import express, { Request, Response, Application } from 'express';
import { TransactionRequest, generateTransactionResponse } from './generators/transaction';


const app: Application = express();
const port = process.env.PORT || 8000;

app.get('/transactions', (req: Request, res: Response) => {
    const { pageNumber, pageSize, keyword, searchIn, sort, showTestTranasctions, filters } = req.query;

    const parsedFilters = JSON.parse(filters as string || "{}");

    const request: TransactionRequest = {
        pageNumber: Number(pageNumber),
        pageSize: Number(pageSize),
        keyword: keyword as string || "",
        searchIn: searchIn as string[] || [],
        sort: sort as any || 'ASC',
        showTestTranasctions: showTestTranasctions === 'true',
        filters: parsedFilters,
    };

    res.json(generateTransactionResponse(request))
});

app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
});