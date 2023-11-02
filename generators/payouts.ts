import { faker } from "@faker-js/faker";
import _ from "lodash";
import { PAYOUTS_STATUSES } from "../constants";

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
    sortOrder: string;
    sortField: string;
    searchIn: string[];
    sort: "asc" | "desc";
    filters: PayoutsFilters;
}

export const generatePayouts = (request: PayoutsRequest) => {
    const numberOfItems = getNumberOfItems(request.filters);
    const payouts: Payout[] = [];
    for (let i = 0; i < numberOfItems; i++) {
        payouts.push({
            payoutDate: faker.date.between({ from: request.filters.from, to: request.filters.to }),
            status: faker.helpers.arrayElement(request.filters.statuses && request.filters.statuses.length > 0 ? _.intersection(PAYOUTS_STATUSES, request.filters.statuses) : PAYOUTS_STATUSES),
            referenceId: faker.string.uuid(),
            IBAN: faker.string.uuid(),
            grossAmount: faker.number.int({ min: 50, max: 300 }),
            netAmount: faker.number.int({ min: request.filters.netAmountFrom || 50, max: request.filters.netAmountTo ||300 }),
            netPayout: faker.number.int({ min: 50, max: 100 }),
            feesDeducted: faker.number.int({ min: 10, max: 50 }),
            currency: "AED",
            numberOfTransactions: faker.number.int({ min: 10, max: 50 }),
            grouped: true,
            organizationId: faker.string.uuid(),
        })
    }

    return payouts;
}

export const generatePayoutsResponse = (request: PayoutsRequest) => {
    let payouts = generatePayouts(request);
    payouts.sort((a, b) => {
        if (request.sortOrder === 'Asc') {
            return a.payoutDate.getTime() - b.payoutDate.getTime();
        } else {
            return b.payoutDate.getTime() - a.payoutDate.getTime();
        }   
    })

    const payoutsInThePage = payouts.slice(0, request.pageSize);
    const organizationIds: string[] = [];
    let netAmount = 0;
    payoutsInThePage.forEach(payout => {
        organizationIds.push(payout.organizationId!);
        netAmount += payout.netAmount;
    });

    const response: PayoutsResponse = {
        pageNumber: request.pageNumber,
        pageSize: request.pageSize,
        totalPages: Math.ceil(payouts.length / request.pageSize),
        currency: "AED",
        payouts: payoutsInThePage,
        netAmount,
        organizationIds,
        TotalPayouts: payouts.length,
    }

    return response;
}

const getNumberOfItems = (filters: PayoutsFilters) => {
    const numberOfItems = 300;
    const numberOfAppliedFilters = Object.keys(filters).filter((key) => {
        const value = filters[key as keyof PayoutsFilters];
        return value !== undefined;
    }).length;
    return numberOfItems - 15 * numberOfAppliedFilters;
}