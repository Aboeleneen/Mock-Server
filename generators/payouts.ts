import { faker } from "@faker-js/faker";
import _ from "lodash";
import { STORE_IDS } from "../constants";
import { readFile, writeFileSync } from "jsonfile";
import { paginateList } from "./helpers";
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import { Payout, PayoutsRequest, PayoutsResponse, PayoutsSummaryRequest } from "../interfaces/payout";
import { Transaction } from "../interfaces/transaction";
import { PAYOUTS } from "./data";

dayjs.extend(customParseFormat)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

export const generatePayouts = () => {
    const numberOfItems = 1000;
    const payouts: Payout[] = [];
    for (let i = 0; i < numberOfItems; i++) {
        const date = faker.date.between({  from: "2024-04-01", to: "2024-10-30" });
        payouts.push({
            payoutDate: dayjs(date).format("YYYY-MM-DD"),
            payoutStatus: faker.helpers.arrayElement([-2, -1, 0, 1, 2, 3, 4]),
            payoutId: faker.string.nanoid(faker.helpers.arrayElement([6, 8, 10, 12, 14])),
            merchantIban: faker.string.uuid(),
            totalAmount: faker.number.int({ min: 50, max: 5000 }),
            netAmount: faker.number.int({ min: 50, max: 5000 }),
            totalFeeAmount: faker.number.int({ min: 10, max: 50 }),
            transactionsNumber: faker.number.int({ min: 10, max: 50 }),
            merchantId: faker.helpers.arrayElement(STORE_IDS),
            payoutCurrency: "AED"
        })
    }
    writeFileSync("data/payouts.json", payouts, 'utf8');
    return payouts;
}

export const generatePayoutsResponse = async (request: PayoutsRequest) => {
    // Sorting
    if (request.orderBy === "payout amount") {
        PAYOUTS.sort((a: Payout, b: Payout) => {
            if (request.orderByDirection === 'Asc') {
                return a.netAmount - b.netAmount;
            } else {
                return b.netAmount - a.netAmount;
            }
        })
    } else {
        PAYOUTS.sort((a: Payout, b: Payout) => {
            if (request.orderByDirection === 'Asc') {
                return new Date(a.payoutDate).getTime() - new Date(b.payoutDate).getTime();
            } else {
                return new Date(b.payoutDate).getTime() - new Date(a.payoutDate).getTime();
            }
        })
    }
    // Filters
    const filteredPayouts = PAYOUTS.filter((payout: Payout) => {
        const { payoutStatus, createFromDate, createToDate, netPayoutAmountFrom, netPayoutAmountTo, merchantId, iban, payoutId } = request;
        let includeItem = true;
        if (payoutStatus && payoutStatus.length) includeItem = includeItem && payoutStatus.includes(convertStatusCodeToValue(payout.payoutStatus));
        if (createFromDate) includeItem = includeItem && dayjs(payout.payoutDate, "YYYY-MM-DD").isSameOrAfter(dayjs(createFromDate, "DD/MM/YYYY"));
        if (createToDate) includeItem = includeItem && dayjs(payout.payoutDate, "YYYY-MM-DD").isSameOrBefore(dayjs(createToDate, "DD/MM/YYYY"));
        if (netPayoutAmountFrom) includeItem = includeItem && payout.netAmount >= netPayoutAmountFrom;
        if (netPayoutAmountTo) includeItem = includeItem && payout.netAmount <= netPayoutAmountTo;
        if (merchantId && merchantId.length) payout.merchantId = faker.helpers.arrayElement(merchantId) // includeItem = includeItem && merchantId.includes(payout.merchantId!); 

        if (iban && iban.length) includeItem = includeItem && iban.includes(payout.merchantIban);
        if (payoutId) includeItem = includeItem && payout.payoutId == payoutId;

        return includeItem;
    })

    const payoutsInThePage: Payout[] = paginateList(filteredPayouts, request.pageSize, request.pageNumber);

    const response: PayoutsResponse = {

        metaData: {
            page: request.pageNumber,
            perPage: request.pageSize,
            pageCount: Math.ceil(filteredPayouts.length / request.pageSize),
            totalCount: filteredPayouts.length
        },
        payouts: payoutsInThePage,
    }

    return response;
}

export const generatePayoutsSummaryResponse = async (request: PayoutsSummaryRequest) => {
    const { storeIds } = request;
    let payouts = await readFile('./data/payouts.json');
    if (storeIds && storeIds.length) {
        payouts = payouts.filter((payout: Payout) => storeIds.includes(payout.merchantId!))
    }

    let totalBalance = 0;
    let unSettledAmount = 0;
    let readyToPayAmount = 0;
    payouts.forEach((payout: Payout) => {
        totalBalance += payout.netAmount;
        unSettledAmount += payout.totalAmount;
        readyToPayAmount += payout.netAmount;
    })

    return {
        totalBalance,
        unSettledAmount,
        readyToPayAmount,
        lastUpdate: new Date(),
        currency: "AED"
    }

}

function convertStatusCodeToValue(statusCode: number) {
    switch (statusCode) {
        case -2:
            return "Fraudulent";
        case -1:
            return "Initiated";
        case 0:
            return "Pending";
        case 1:
            return "InProgress";
        case 2:
            return "Approved";
        case 3:
            return "Rejected";
        case 4:
            return "Completed";
        default:
            return "Unknown";
    }
}