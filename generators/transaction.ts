import { faker, tr } from "@faker-js/faker";
import _ from "lodash";
import { CURRENCIES, DYNAMIC_CURRENCY_COVERSION, PATMENT_METHODS, PAYMENT_TYPES, SCHEME_TYPES, TRANSACTION_STATUSES } from "../constants";

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
    payoutId?: string;
    countryCode: string;
    phoneNumber: string;
    batchNumber: string;
    totalRefundAmount?: number;
    refundStatus?: string;
    organizationId?: string;
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
    payoutId?: string;
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
    sort: "Asc" | "Desc";
    showTestTranasctions: boolean;
    filters: TransactionFilters;
}

export const generateTransactions = (request: TransactionRequest) => {
    const numberOfItems = getNumberOfItems(request.filters);
    const transactions: Transaction[] = [];
    for (let i = 0; i < numberOfItems; i++) {
        transactions.push({
            transactionId: faker.string.uuid(),
            orderId: faker.string.uuid(),
            transactionDateTime: faker.date.between({ from: request.filters.from, to: request.filters.to }),
            transactionStatus: faker.helpers.arrayElement(request.filters.statuses && request.filters.statuses.length > 0 ? _.intersection(TRANSACTION_STATUSES, request.filters.statuses) : TRANSACTION_STATUSES),
            tid: faker.string.uuid(),
            paymentType: faker.helpers.arrayElement(request.filters.paymentTypes && request.filters.paymentTypes.length > 0 ? _.intersection(PAYMENT_TYPES, request.filters.paymentTypes) : PAYMENT_TYPES),
            grossAmount: faker.number.int({ min: 50, max: 300 }),
            netAmount: faker.number.int({ min: 50, max: 300 }),
            financedAmount: faker.number.int({ min: 50, max: 100 }),
            cashPayment: faker.number.int({ min: 50, max: 100 }),
            originalAmount: faker.number.int({ min: 50, max: 100 }),
            originalCurrency: faker.helpers.arrayElement(CURRENCIES),
            currency: "AED",
            paymentMethod: faker.helpers.arrayElement(PATMENT_METHODS),
            maskedCardNumber: faker.finance.creditCardNumber(),
            cardType: faker.helpers.arrayElement(request.filters.schemes && request.filters.schemes.length > 0 ? _.intersection(SCHEME_TYPES, request.filters.schemes) : SCHEME_TYPES),
            merchantReferenceId: faker.string.uuid(),
            payoutId: request.filters.payoutId || faker.string.uuid(),
            countryCode: faker.location.countryCode("numeric"),
            phoneNumber: faker.phone.number(),
            batchNumber: faker.finance.accountNumber(),
            totalRefundAmount: 0,
            refundStatus: faker.helpers.arrayElement(request.filters.refundStatus && request.filters.refundStatus.length > 0 ? request.filters.refundStatus : TRANSACTION_STATUSES),
            organizationId: faker.string.uuid(),
            payByLinkId: faker.string.uuid(),
            dcc: faker.helpers.arrayElement(request.filters.dcc && request.filters.dcc.length > 0 ? _.intersection(DYNAMIC_CURRENCY_COVERSION, request.filters.schemes) : DYNAMIC_CURRENCY_COVERSION),
        })
    }

    return transactions;
}

export const generateTransactionResponse = (request: TransactionRequest) => {
    let transactions = generateTransactions(request);
    transactions.sort((a, b) => {
        if (request.sort === 'Asc') {
            return a.transactionDateTime.getTime() - b.transactionDateTime.getTime();
        } else {
            return b.transactionDateTime.getTime() - a.transactionDateTime.getTime();
        }
    })

    const transactionsInThePage = transactions.slice(0, request.pageSize);
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
        totalProducts: totalAmount,
        totalSearchMatches: transactions.length
    }

    return response;
}

const getNumberOfItems = (filters: TransactionFilters) => {
    const numberOfItems = 300;
    const numberOfAppliedFilters = Object.keys(filters).filter((key) => {
        const value = filters[key as keyof TransactionFilters];
        return value !== undefined;
    }).length;
    return numberOfItems - 15 * numberOfAppliedFilters;
}