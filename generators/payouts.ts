import { faker } from "@faker-js/faker";
import _ from "lodash";
import { PAYOUTS_STATUSES, STORE_IDS } from "../constants";
import { readFile, writeFileSync } from "jsonfile";
import { paginateList } from "./helpers";
import { Transaction } from "./transaction";

export interface Payout {
    referenceId: string;
    IBAN: string;
    payoutDate: Date;
    status: string;
    grossAmount: number;
    netAmount: number;
    netPayout: number;
    feesDeducted: number;
    numberOfTransactions: number;
    currency: string;
    grouped: boolean;
    organizationId?: string;
    refundAndChargeback: number;
    settlementFees: number;
}

export interface PayoutsResponse {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    TotalPayouts: number;
    netAmount: number;
    currency: string;
    organizationIds: string[];
    payouts: Payout[];
}


export interface PayoutsFilters {
    statuses?: string[];
    refundStatus?: string[];
    netAmountFrom?: number;
    netAmountTo?: number;
    from: Date;
    to: Date;
    storeIds: string[];
}

export interface PayoutsRequest {
    pageNumber: number;
    pageSize: number;
    keyword: string;
    sortOrder: "Asc" | "Desc";
    sortBy: "PayoutDateTime" | "NetPayout";
    searchIn: string;
    filters: PayoutsFilters;
}

export interface PayoutsSummaryRequest {
    storeIds: string[];
}

export const generatePayouts = () => {
    const numberOfItems = 1000;
    const payouts: Payout[] = [];
    for (let i = 0; i < numberOfItems; i++) {
        payouts.push({
            payoutDate: faker.date.between({ from: "2023-11-01", to: "2023-12-30" }),
            status: faker.helpers.arrayElement(PAYOUTS_STATUSES),
            referenceId: faker.string.nanoid(faker.helpers.arrayElement([6, 8, 10, 12, 14])),
            IBAN: faker.string.uuid(),
            grossAmount: faker.number.int({ min: 50, max: 5000 }),
            netAmount: faker.number.int({ min: 50, max: 5000 }),
            netPayout: faker.number.int({ min: 50, max: 5000 }),
            feesDeducted: faker.number.int({ min: 10, max: 50 }),
            currency: "AED",
            numberOfTransactions: faker.number.int({ min: 10, max: 50 }),
            grouped: true,
            organizationId: faker.helpers.arrayElement(STORE_IDS),
            refundAndChargeback: faker.number.int({ min: 30, max: 500 }),
            settlementFees: faker.number.int({ min: 30, max: 500 })
        })
    }
    writeFileSync("data/payouts.json", payouts, 'utf8');
    return payouts;
}

export const generatePayoutsResponse = async (request: PayoutsRequest) => {
    let payouts = await readFile('./data/payouts.json');
    let transactions: Transaction[] = await readFile('./data/transactions.json');

    // Sorting
    if (request.sortBy === "NetPayout") {
        payouts.sort((a: Payout, b: Payout) => {
            if (request.sortOrder === 'Asc') {
                return a.netPayout - b.netPayout;
            } else {
                return b.netPayout - a.netPayout;
            }
        })
    } else {
        payouts.sort((a: Payout, b: Payout) => {
            if (request.sortOrder === 'Asc') {
                return new Date(a.payoutDate).getTime() - new Date(b.payoutDate).getTime();
            } else {
                return new Date(b.payoutDate).getTime() - new Date(a.payoutDate).getTime();
            }
        })
    }

    // Filters
    payouts = payouts.filter((payout: Payout) => {
        if (!request.filters) return true;
        const { statuses, from, to, netAmountFrom, netAmountTo, storeIds } = request.filters;
        let includeItem = true;
        if (statuses && statuses.length) includeItem = includeItem && statuses.includes(payout.status);
        if (from) includeItem = includeItem && payout.payoutDate >= from;
        if (to) includeItem = includeItem && payout.payoutDate <= to;
        if (netAmountFrom) includeItem = includeItem && payout.netPayout >= netAmountFrom;
        if (netAmountTo) includeItem = includeItem && payout.netPayout <= netAmountTo;
        if (storeIds && storeIds.length) includeItem = includeItem && storeIds.includes(payout.organizationId!);

        if (request.searchIn === "IBAN") includeItem = includeItem && payout.IBAN.includes(request.keyword);
        if (request.searchIn === "PayoutId") includeItem = includeItem && payout.referenceId.includes(request.keyword);

        return includeItem;
    })

    const payoutsInThePage: Payout[] = paginateList(payouts, request.pageSize, request.pageNumber);
    const organizationIds: string[] = [];
    let netAmount = 0;
    payoutsInThePage.forEach(payout => {
        organizationIds.push(payout.organizationId!);
        netAmount += payout.netAmount;
    });

    const returnedPayouts = payoutsInThePage.map(payout => ({
        ...payout,
        numberOfTransactions: transactions.filter(transaction => transaction.payoutId === payout.referenceId).length
    }))



    const response: PayoutsResponse = {
        pageNumber: request.pageNumber,
        pageSize: request.pageSize,
        totalPages: Math.ceil(payouts.length / request.pageSize),
        currency: "AED",
        payouts: returnedPayouts,
        netAmount,
        organizationIds,
        TotalPayouts: payouts.length,
    }

    return response;
}


export const generatePayoutsSummaryResponse = async (request: PayoutsSummaryRequest) => {
    const { storeIds } = request;
    let payouts = await readFile('./data/payouts.json');
    if (storeIds && storeIds.length) {
        payouts = payouts.filter((payout: Payout) => storeIds.includes(payout.organizationId!))
    }

    let totalBalance = 0;
    let unSettledAmount = 0;
    let readyToPayAmount = 0;
    payouts.forEach((payout: Payout) => {
        totalBalance += payout.netPayout;
        unSettledAmount += payout.grossAmount;
        readyToPayAmount += payout.netAmount;
    })

    return {
        totalBalance,
        unSettledAmount,
        readyToPayAmount,
        lastUpdate: new Date()
    }

}