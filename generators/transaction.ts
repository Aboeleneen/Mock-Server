import { faker, tr } from "@faker-js/faker";
import _ from "lodash";
import { CURRENCIES, DYNAMIC_CURRENCY_COVERSION, PATMENT_METHODS, PAYMENT_TYPES, SCHEME_TYPES, STORE_IDS, TRANSACTION_STATUSES } from "../constants";
import { readFile } from "jsonfile";
import { paginateList } from "./helpers";
import { writeFileSync } from 'fs';

export interface Transaction {
    transactionId: string;
    orderId: string;
    transactionDateTime: Date;
    transactionStatus: string;
    tid: string;
    paymentType: string;
    grossAmount: number;
    netAmount: number;
    financedAmount?: number;
    cashPayment?: number;
    originalAmount?: number;
    originalCurrency: string;
    currency: string;
    paymentMethod: string;
    maskedCardNumber: string;
    cardType?: string;
    merchantReferenceId: string;
    payoutId: string;
    countryCode: string;
    phoneNumber: string;
    batchNumber: string;
    totalRefundAmount?: number;
    refundStatus?: string;
    organizationId: string;
    payByLinkId?: string;
    payByLinkType?: string;
    dcc?: string;
}
export interface TransactionResponse {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalSales: number;
    totalSearchMatches: number;
    totalAmount: number;
    netAmount: number;
    currency: string;
    totalProducts: number;
    organizationIds: string[];
    transactions: Transaction[];
}

export interface TransactionFilters {
    // payoutId?: string;
    paymentMethods?: string[];
    paymentTypes?: string[];
    statuses?: string[];
    refundStatus?: string[];
    netAmountFrom?: number;
    netAmountTo?: number;
    from: Date;
    to: Date;
    storeIds: string[];
    businessId?: string;
    schemes?: string[];
    dcc?: string[];
}

export interface TransactionRequest {
    pageNumber: number;
    pageSize: number;
    keyword: string;
    searchIn: string[];
    sortOrder: "Asc" | "Desc";
    sortBy: "TransactionDateTime" | "NetAmount";
    showTestTranasctions: boolean;
    filters: TransactionFilters;
}

export const generateTransactions = () => {
    const numberOfItems = 1000;
    const transactions: Transaction[] = [];
    let terminalIds = [];
    for (let index = 0; index < 50; index++) {
        terminalIds.push(faker.string.uuid());
    }
    for (let i = 0; i < numberOfItems; i++) {
        transactions.push({
            transactionId: faker.string.uuid(),
            orderId: faker.string.uuid(),
            transactionDateTime: faker.date.between({ from: "2023-05-01", to: "2023-11-30" }),
            transactionStatus: faker.helpers.arrayElement(TRANSACTION_STATUSES),
            tid: faker.helpers.arrayElement(terminalIds),
            paymentType: faker.helpers.arrayElement(PAYMENT_TYPES),
            grossAmount: faker.number.int({ min: 50, max: 300 }),
            netAmount: faker.number.int({ min: 50, max: 300 }),
            financedAmount: faker.number.int({ min: 50, max: 100 }),
            cashPayment: faker.number.int({ min: 50, max: 100 }),
            originalAmount: faker.number.int({ min: 50, max: 100 }),
            originalCurrency: faker.helpers.arrayElement(CURRENCIES),
            currency: "AED",
            paymentMethod: faker.helpers.arrayElement(PATMENT_METHODS),
            maskedCardNumber: faker.finance.creditCardNumber(),
            cardType: faker.helpers.arrayElement(SCHEME_TYPES),
            merchantReferenceId: faker.string.uuid(),
            payoutId: faker.string.uuid(),
            countryCode: faker.location.countryCode("numeric"),
            phoneNumber: faker.phone.number(),
            batchNumber: faker.finance.accountNumber(),
            totalRefundAmount: 0,
            refundStatus: faker.helpers.arrayElement(TRANSACTION_STATUSES),
            organizationId: faker.helpers.arrayElement(STORE_IDS),
            payByLinkId: faker.string.uuid(),
            dcc: faker.helpers.arrayElement(DYNAMIC_CURRENCY_COVERSION),
        })
    }
    writeFileSync("data/transactions.json", JSON.stringify(transactions), 'utf8');
    return transactions;
}

export const generateTransactionResponse = async (request: TransactionRequest) => {
    let transactions: Transaction[] = await readFile('./data/transactions.json');
    // Sorting
    if (request.sortBy === "NetAmount") {
        transactions.sort((a: Transaction, b: Transaction) => {
            if (request.sortOrder === 'Asc') {
                return a.netAmount - b.netAmount;
            } else {
                return b.netAmount - a.netAmount;
            }
        })
    } else {
        transactions.sort((a: Transaction, b: Transaction) => {
            if (request.sortOrder === 'Asc') {
                return new Date(a.transactionDateTime).getTime() - new Date(b.transactionDateTime).getTime();
            } else {
                return new Date(b.transactionDateTime).getTime() - new Date(a.transactionDateTime).getTime();
            }
        })
    }
    // Filters
    transactions = transactions.filter((transaction: Transaction) => {
        if (!request.filters) return true;
        const { statuses, schemes, from, to, netAmountFrom, netAmountTo, storeIds, dcc, paymentMethods } = request.filters;
        let includeItem = true;
        if (statuses && statuses.length) includeItem = includeItem && statuses.includes(transaction.transactionStatus);
        if (schemes && schemes.length) includeItem = includeItem && schemes.includes(transaction.cardType || '');
        if (from) includeItem = includeItem && transaction.transactionDateTime >= from;
        if (to) includeItem = includeItem && transaction.transactionDateTime <= to;
        if (netAmountFrom) includeItem = includeItem && transaction.netAmount >= netAmountFrom;
        if (netAmountTo) includeItem = includeItem && transaction.netAmount <= netAmountTo;
        if (storeIds && storeIds.length) includeItem = includeItem && storeIds.includes(transaction.organizationId);
        if (dcc && dcc.length) includeItem = includeItem && dcc.includes(transaction.dcc || "");
        if (paymentMethods && paymentMethods.length) includeItem = includeItem && paymentMethods.includes(transaction.paymentMethod);
        if (request.searchIn.includes("PayoutId")) includeItem = includeItem && transaction.payoutId.includes(request.keyword);
        if (request.searchIn.includes("TerminalId")) includeItem = includeItem && transaction.tid.includes(request.keyword);
        if (request.searchIn.includes("TransactionId")) includeItem = includeItem && transaction.transactionId.includes(request.keyword);
        return includeItem;
    })

    const transactionsInThePage = paginateList(transactions, request.pageSize, request.pageNumber);
    const organizationIds: string[] = [];
    let netAmount = 0;
    let totalSales = 0;
    let totalAmount = 0;
    transactionsInThePage.forEach(transaction => {
        organizationIds.push(transaction.organizationId!);
        netAmount += transaction.netAmount;
        totalSales += transaction.grossAmount;
        totalAmount += transaction.originalAmount!;
    });

    const response: TransactionResponse = {
        pageNumber: request.pageNumber,
        pageSize: request.pageSize,
        totalPages: Math.ceil(transactions.length / request.pageSize),
        currency: "AED",
        transactions: transactionsInThePage,
        netAmount,
        organizationIds,
        totalAmount,
        totalSales,
        totalProducts: transactions.length,
        totalSearchMatches: transactions.length
    }

    return response;
}