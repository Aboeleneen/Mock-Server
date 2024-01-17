import { readFile } from "jsonfile";
import { Transaction } from "./transaction";
import { faker } from "@faker-js/faker";

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
        console.log("Comparison Start Date", transaction.localDate, new Date(startDate), new Date(transaction.localDate) >= new Date(startDate))

        if (startDate) includeItem &&= new Date(transaction.localDate) >= new Date(startDate);
        if (endDate) includeItem &&= new Date(transaction.localDate) <= new Date(endDate);
        if (schemes && schemes.length > 0) includeItem &&= schemes.includes(transaction.cardProduct || '');
        if (statuses && statuses.length > 0) includeItem &&= statuses.includes(transaction.paymentStatus.toString());
        if (storeIds && storeIds.length > 0) transaction.merchantId = faker.helpers.arrayElement(storeIds) // includeItem &&= storeIds.includes(transaction.merchantId);

        return includeItem;
    })
}

const groupTransactions = (transactions: Transaction[], chartCode: string) => {
    let getGroupingField;
    if (chartCode === "Date") {
        getGroupingField = (transaction: Transaction) => new Date(transaction.localDate).toDateString();
    }

    else if (chartCode === "Store") {
        getGroupingField = (transaction: Transaction) => transaction.merchantId;
    }

    else if (chartCode === "Scheme") {
        getGroupingField = (transaction: Transaction) => transaction.cardProduct!;
    }

    else {
        getGroupingField = (transaction: Transaction) => transaction.paymentStatus.toString()!;
    }

    return groupTransactionBasedOnField(transactions, getGroupingField);
};

const groupTransactionBasedOnField = (transactions: Transaction[], getGroupingField: (transaction: Transaction) => string) => {
    const metrics = new Map<string, MetricsResponse<string>>();
    transactions.forEach(transaction => {
        const groupingField = getGroupingField(transaction)
        if (metrics.has(groupingField)) {
            const currentMetric = metrics.get(groupingField)!;
            currentMetric.numberOfTransactions += 1;
            currentMetric.totalAmount += transaction.amount;
            metrics.set(groupingField, currentMetric);
        } else {
            const currentMetric: MetricsResponse<string> = {
                field: groupingField,
                numberOfTransactions: 1,
                totalAmount: transaction.amount
            }
            metrics.set(groupingField, currentMetric);
        }
    })
    return metrics;
}