import { faker, tr } from "@faker-js/faker";
import _ from "lodash";
import { DYNAMIC_CURRENCY_COVERSION, PATMENT_METHODS, PAYMENT_TYPES, SCHEME_TYPES, STORE_IDS, TRANSACTION_STATUSES } from "../constants";
import { readFile } from "jsonfile";
import { paginateList } from "./helpers";
import { writeFileSync } from 'fs';
import { Payout } from "./payouts";

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
    originalCurrency?: string;
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
    exchangeRate?: number;
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
    sortBy: "TransactionDateTime" | "Amount";
    showTestTranasctions: boolean;
    filters: TransactionFilters;
}

export const  generateTransactions = async() => {
    const numberOfItems = 1000;
    const transactions: Transaction[] = [];
    const payouts: Payout[] = await readFile('./data/payouts.json');
    const payoutIds = payouts.map(payout => payout.referenceId);
    let terminalIds = [];
    for (let index = 0; index < 50; index++) {
        terminalIds.push(faker.string.uuid());
    }
    const USD_TO_AED_RATE = 3.67;
    for (let i = 0; i < numberOfItems; i++) {
        let transactionStatus = faker.helpers.arrayElement(TRANSACTION_STATUSES);
        let amount = faker.number.float({ min: 100, max: 100000 })
        let dcc = faker.helpers.arrayElement(DYNAMIC_CURRENCY_COVERSION)
        transactions.push({
            transactionId: faker.string.uuid(),
            orderId: faker.string.uuid(),
            transactionDateTime: faker.date.between({ from: "2023-10-15", to: "2023-12-30" }),
            transactionStatus,
            tid: faker.helpers.arrayElement(terminalIds),
            paymentType: faker.helpers.arrayElement(PAYMENT_TYPES),
            grossAmount: amount,
            netAmount: faker.number.float({ min: 100, max: 100000 }),
            financedAmount: faker.number.int({ min: 50, max: 1000 }),
            cashPayment: faker.number.int({ min: 50, max: 1000 }),
            originalAmount: dcc === "ForeignCurrency" ? (amount / 3.67) : undefined,
            originalCurrency: dcc === "ForeignCurrency" ? "USD" : undefined,
            currency: "AED",
            paymentMethod: faker.helpers.arrayElement(PATMENT_METHODS),
            maskedCardNumber: faker.finance.creditCardNumber(),
            cardType: faker.helpers.arrayElement(SCHEME_TYPES),
            merchantReferenceId: faker.string.uuid(),
            payoutId: faker.helpers.arrayElement(payoutIds),
            countryCode: faker.location.countryCode("numeric"),
            phoneNumber: faker.phone.number(),
            batchNumber: faker.finance.accountNumber(),
            totalRefundAmount: getRefundAmount(transactionStatus, amount),
            refundStatus: faker.helpers.arrayElement(TRANSACTION_STATUSES),
            organizationId: faker.helpers.arrayElement(STORE_IDS),
            payByLinkId: faker.string.uuid(),
            dcc,
            exchangeRate: dcc === "ForeignCurrency" ? USD_TO_AED_RATE : undefined
        })
    }
    writeFileSync("data/transactions.json", JSON.stringify(transactions), 'utf8');
    return transactions;
}

const getRefundAmount = (refundStatus: string, originalAmount: number) => {
    switch (refundStatus) {
        case "PartialRefundDone":
        case "PartialRefundInitiated":
            return faker.number.float({ min: 100, max: originalAmount })
        case "ExcessiveRefundDone":
        case "ExcessiveRefundInitiated":
            return faker.number.float({ min: 100, max: originalAmount - 100 })
            break;
        case "FullRefundDone":
        case "FullRefundInitiated":
            return originalAmount;
        default:
            break;
    }
    return 0;
}

export const generateTransactionResponse = async (request: TransactionRequest) => {
    let transactions: Transaction[] = await readFile('./data/transactions.json');
    

    // Sorting
    if (request.sortBy === "Amount") {
        transactions.sort((a: Transaction, b: Transaction) => {
            if (request.sortOrder === 'Asc') {
                return a.grossAmount - b.grossAmount;
            } else {
                return b.grossAmount - a.grossAmount;
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
        if (netAmountFrom) includeItem = includeItem && transaction.grossAmount >= netAmountFrom;
        if (netAmountTo) includeItem = includeItem && transaction.grossAmount <= netAmountTo;
        if (storeIds && storeIds.length) includeItem = includeItem && storeIds.includes(transaction.organizationId);
        if (dcc && dcc.length) includeItem = includeItem && dcc.includes(transaction.dcc || "");
        if (paymentMethods && paymentMethods.length) includeItem = includeItem && paymentMethods.includes(transaction.paymentMethod);
        if (includeItem && request.searchIn && request.searchIn.length > 0) {
            let searchMatch = false; 
            if (request.searchIn?.includes("PayoutId")) searchMatch = transaction.payoutId.includes(request.keyword);
            if (request.searchIn?.includes("TerminalId")) searchMatch = searchMatch || transaction.tid.includes(request.keyword);
            if (request.searchIn?.includes("TransactionId")) searchMatch = searchMatch || transaction.transactionId.includes(request.keyword);
            return searchMatch;
        }
        return includeItem;
    })

    const transactionsInThePage = paginateList(transactions, request.pageSize, request.pageNumber);
    const organizationIds: string[] = [];
    let netAmount = 0;
    let totalSales = 0;
    let totalAmount = 0;
    transactionsInThePage.forEach(transaction => {
        organizationIds.push(transaction.organizationId!);
        // netAmount += transaction.netAmount;
        // totalSales += transaction.grossAmount;
        // totalAmount += transaction.grossAmount;
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