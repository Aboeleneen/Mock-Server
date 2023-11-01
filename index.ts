import express, { Request, Response, Application } from 'express';
import { TransactionRequest, generateTransactionResponse } from './generators/transaction';


const app: Application = express();
app.use(express.json())
const port = process.env.PORT || 8000;

app.post('/transactions', (req: Request, res: Response) => {
    // const { pageNumber, pageSize, keyword, searchIn, sort, showTestTranasctions, filters } = req.body;

    // const parsedFilters = JSON.parse(filters as string || "{}");

    // const request: TransactionRequest = {
    //     pageNumber: Number(pageNumber),
    //     pageSize: Number(pageSize),
    //     keyword: keyword as string || "",
    //     searchIn: searchIn as string[] || [],
    //     sort: sort as any || 'ASC',
    //     showTestTranasctions: showTestTranasctions === 'true',
    //     filters: parsedFilters,
    // };

    res.json(generateTransactionResponse(req.body as TransactionRequest))
});

app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
});