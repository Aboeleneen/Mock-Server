import { readFile } from "jsonfile";
import { Transaction } from "./transaction";

export interface MetricsRequest {
    chartCode: string;
    startDate: Date;
    endDate: Date;
    schemes: string[];
    statuses: string[];
    storeIds: string[];
}
export interface MetricsResponse<T> {
    field: T;
    totalAmount: number;
    numberOfTransactions: number;
}

export const generateTransactionMetrics = async (request: MetricsRequest) => {
    let transactions: Transaction[] = await readFile('./data/transactions.json');
    const filteredTransactions = applyFilters(request, transactions);
    const metrics = groupTransactions(filteredTransactions, request.chartCode)!;
    return {
        metrics: Array.from(metrics).map(([_, value]) => value),
    }
}


const applyFilters = (request: MetricsRequest, transactions: Transaction[]) => {
    const { startDate, endDate, schemes, statuses, storeIds } = request;
    return transactions.filter(transaction => {
        let includeItem = true;
        console.log("Comparison Start Date", transaction.transactionDateTime, new Date(startDate), new Date(transaction.transactionDateTime) >= new Date(startDate))

        if (startDate) includeItem &&= new Date(transaction.transactionDateTime) >= new Date(startDate);
        if (endDate) includeItem &&= new Date(transaction.transactionDateTime) <= new Date(endDate);
        if (schemes && schemes.length > 0) includeItem &&= schemes.includes(transaction.cardType || '');
        if (statuses && statuses.length > 0) includeItem &&= statuses.includes(transaction.transactionStatus);
        if (storeIds && storeIds.length > 0) includeItem &&= storeIds.includes(transaction.organizationId);

        return includeItem;
    })
}

const groupTransactions = (transactions: Transaction[], chartCode: string) => {
    if (chartCode === "Date") {
        const metrics = new Map<string, MetricsResponse<string>>();
        transactions.forEach(transaction => {
            const transactionDate = new Date(transaction.transactionDateTime).toDateString();
            if (metrics.has(transactionDate)) {
                const currentMetric = metrics.get(transactionDate)!;
                currentMetric.numberOfTransactions += 1;
                currentMetric.totalAmount += transaction.originalAmount!;
                metrics.set(transactionDate, currentMetric);
            } else {
                const currentMetric: MetricsResponse<string> = {
                    field: transactionDate,
                    numberOfTransactions: 1,
                    totalAmount: transaction.originalAmount!
                }
                metrics.set(transactionDate, currentMetric);
            }
        })
        return metrics;
    }
};