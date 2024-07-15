import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import { DayMetricsResponse, MetricsDto, MetricsRequest, MetricsResponse } from "../interfaces/metrics";
import { Transaction } from "../interfaces/transaction";
import { TRANSACTIONS } from "./data";
import { faker } from '@faker-js/faker';

dayjs.extend(customParseFormat)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

export const generateTransactionMetrics = async (request: MetricsRequest): Promise<MetricsResponse> => {
    const filteredTransactions = applyFilters(request, TRANSACTIONS);
    const metrics = groupTransactions(filteredTransactions, request.chartCode)!;
    return {
        chart: Array.from(metrics).map(([_, value]) => value),
    }
}

export const generateTransactionDayMetrics = async (request: MetricsRequest): Promise<DayMetricsResponse> => {
    const filteredTransactions = applyFilters(request, TRANSACTIONS);
    const metrics = groupTransactions(filteredTransactions, "Date")!;
    return {
        dayGraph: Array.from(metrics).map(([_, value]) => ({
            transactionsAmount: value.metric2,
            transactionsCount: value.metric1,
            averageTransactionAmount: value.metric2 / value.metric1,
            date: value.metric5
        })),
    }
}

const applyFilters = (request: MetricsRequest, transactions: Transaction[]) => {
    const { merchantId, createFromDate, createToDate, paymentStatus, scheme, transactionType } = request;
    return transactions.filter(transaction => {
        let includeItem = true;
        if (createFromDate) includeItem = includeItem && dayjs(transaction.localDate, "YYYY-MM-DD").isSameOrAfter(dayjs(createFromDate, "DD/MM/YYYY"));
        if (createToDate) includeItem = includeItem && dayjs(transaction.localDate, "YYYY-MM-DD").isSameOrBefore(dayjs(createToDate, "DD/MM/YYYY"));
        if (scheme && scheme.length) {
            includeItem = includeItem && (
                ((scheme.includes("VI") || scheme.includes("VL")) && transaction.cardProduct === "Visa") ||
                ((scheme.includes("MI") || scheme.includes("ML")) && transaction.cardProduct === "Mastercard") ||
                (scheme.includes("AX") && transaction.cardProduct === "AMEX")
            );
        } if (paymentStatus && paymentStatus.length) includeItem = includeItem && paymentStatus.includes(transaction.paymentStatus);
        if (merchantId && merchantId.length > 0) transaction.merchantId = faker.helpers.arrayElement(merchantId)  //includeItem = includeItem && merchantId.includes(transaction.merchantId); 
        if (transactionType && transactionType.length) includeItem = includeItem && transactionType.includes(transaction.transactionType || '')
        return includeItem;
    })
}

const groupTransactions = (transactions: Transaction[], chartCode: string) => {
    let getGroupingField;
    if (chartCode === "Date") {
        getGroupingField = (transaction: Transaction) => transaction.localDate;
    }
    else if (chartCode === "ChartCode1") { // store
        getGroupingField = (transaction: Transaction) => transaction.merchantId;
    }
    else if (chartCode === "ChartCode3") { // scheme
        getGroupingField = (transaction: Transaction) => {
            if (transaction.cardProduct === "Mastercard") return "MI";
            else if (transaction.cardProduct === "AMEX") return "AX";
            else if (transaction.cardProduct === "Visa") return "VI";
            else return transaction.cardProduct!
        };
    }
    else if (chartCode === "ChartCode2") { // type
        getGroupingField = (transaction: Transaction) => transaction.transactionType!;
    } else {
        return;
    }

    return groupTransactionBasedOnField(transactions, getGroupingField!);
};

const groupTransactionBasedOnField = (transactions: Transaction[], getGroupingField: (transaction: Transaction) => string) => {
    const metrics = new Map<string, MetricsDto>();
    transactions.forEach(transaction => {
        const groupingField = getGroupingField(transaction)
        if (metrics.has(groupingField)) {
            const currentMetric = metrics.get(groupingField)!;
            currentMetric.metric1 += 1;
            currentMetric.metric2 += transaction.amount;
            currentMetric.metric5 = groupingField;
            metrics.set(groupingField, currentMetric);
        } else {
            const currentMetric: MetricsDto = {
                metric5: groupingField,
                metric1: 1,
                metric2: transaction.amount
            }
            metrics.set(groupingField, currentMetric);
        }
    })
    return metrics;
}


function mapTransactionStatus(status: number) {
    switch (status) {
        case 0:
            return "Pending";
        case 1:
            return "SubmittedToPayment";
        case 2:
            return "Paid";
        case 3:
            return "Declined";
        default:
            return "";
    }
}