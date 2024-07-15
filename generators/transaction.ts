import { faker } from "@faker-js/faker";
import _ from "lodash";
import { DYNAMIC_CURRENCY_COVERSION, PATMENT_METHODS, SCHEME_TYPES, STORE_IDS, TRANSACTION_TYPES } from "../constants";
import { readFile } from "jsonfile";
import { paginateList } from "./helpers";
import { writeFileSync } from 'fs';
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import { Transaction, TransactionRequest, TransactionResponse } from "../interfaces/transaction";
import { Payout } from "../interfaces/payout";
import { TRANSACTIONS } from "./data";

dayjs.extend(customParseFormat)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

export const generateTransactions = async () => {
    const numberOfItems = 10000;
    const transactions: Transaction[] = [];
    const payouts: Payout[] = await readFile('./data/payouts.json');
    const payoutIds = payouts.map(payout => payout.payoutId);
    let terminalIds = [];
    for (let index = 0; index < 50; index++) {
        terminalIds.push(faker.string.uuid());
    }
    const USD_TO_AED_RATE = 3.67;
    const ammountRange = { min: 1, max: 100000 };
    for (let i = 0; i < numberOfItems; i++) {
        let transactionStatus = faker.helpers.arrayElement([0, 1, 2, 3]);
        let amount = faker.number.int(ammountRange)
        let dcc = faker.helpers.arrayElement(DYNAMIC_CURRENCY_COVERSION)
        const date = faker.date.between({ from: "2024-04-01", to: "2024-10-30" });
        transactions.push({
            referenceNumber: faker.string.nanoid(faker.helpers.arrayElement([6, 8, 10, 12, 14])),
            localDate: dayjs(date).format("YYYY-MM-DD"),
            localTime: Number(dayjs(date).format("HHmmss")),
            paymentStatus: transactionStatus,
            terminalId: faker.helpers.arrayElement(terminalIds),
            transactionType: faker.helpers.arrayElement(TRANSACTION_TYPES),
            amount: amount,
            netAmount: faker.number.int(ammountRange),
            commissionAmount: faker.number.int(ammountRange),
            settlementAmount: dcc === "ForeignCurrency" ? (amount / 3.67) : 784,
            settlementCurrency: dcc === "ForeignCurrency" ? 840 : 784,
            transactionCurrency: 784,
            paymentMethod: faker.helpers.arrayElement(PATMENT_METHODS),
            cardProduct: faker.helpers.arrayElement(SCHEME_TYPES),
            payoutId: faker.helpers.arrayElement(payoutIds),
            merchantId: faker.helpers.arrayElement(STORE_IDS),
            exchangeRate: dcc === "ForeignCurrency" ? USD_TO_AED_RATE : 1,
            GrossAmount: faker.commerce.price(),
            LastUpdatedDate: faker.date.past(),
            CustomerEmail: faker.internet.email(),
            PhoneNumber: faker.phone.number(),
            OrderId: faker.string.uuid(),
            VAT: parseFloat(faker.finance.amount(0, 20)),
            CashbackAmount: parseFloat(faker.finance.amount(0, 100)),
            PaymentLinkNumber: faker.string.uuid(),
            CardHolderName: faker.person.fullName(),
            MaskedCardNumber: faker.finance.creditCardNumber(),
            CardExpiryDate: faker.date.future(),
            TerminalName: faker.company.name(),
            TerminalLocation: faker.location.city(),
            PayoutStatus: faker.helpers.arrayElement(['Pending', 'Completed']),
            PayoutSettlementAmount: parseFloat(faker.finance.amount(0, 1000)),
            PayoutPaymentDate: faker.date.future(),
            InstallmentBank: faker.finance.accountName(),
            InstallmentType: faker.helpers.arrayElement(['Personal Loan', 'Credit Card']),
            Tenor: faker.number.int({ min: 6, max: 36 }).toString(),
            InstallmentDiscountRate: parseFloat(faker.finance.amount(0, 10)),
            authorizationCode: faker.string.sample()
        })
    }
    writeFileSync("data/transactions.json", JSON.stringify(transactions), 'utf8');
    return transactions;
}

export const generateTransactionResponse = async (request: TransactionRequest) => {
    // Sorting
    if (request.orderBy === "amount") {
        TRANSACTIONS.sort((a: Transaction, b: Transaction) => {
            if (request.orderByDirection === 'Asc') {
                return a.amount - b.amount;
            } else {
                return b.amount - a.amount;
            }
        })
    } else {
        TRANSACTIONS.sort((a: Transaction, b: Transaction) => {
            if (request.orderByDirection === 'Asc') {
                return new Date(a.localDate).getTime() - new Date(b.localDate).getTime();
            } else {
                return new Date(b.localDate).getTime() - new Date(a.localDate).getTime();
            }
        })
    }
    // Filters
    const filteredTransactions = TRANSACTIONS.filter((transaction: Transaction) => {
        const { paymentStatus, transactionType, scheme, createFromDate, createToDate, amountFrom, amountTo, merchantId, isDcc, paymentMethod, payoutId, terminalId, referenceNumber } = request;
        let includeItem = true;
        if (paymentStatus && paymentStatus.length) includeItem = includeItem && paymentStatus.includes(transaction.paymentStatus);
        if (scheme && scheme.length) {
            includeItem = includeItem && scheme.includes(transaction.cardProduct);
        }
        if (createFromDate && createToDate) includeItem = includeItem && dayjs(transaction.localDate, "YYYY-MM-DD").isSameOrAfter(dayjs(createFromDate, "DD/MM/YYYY"));
        if (createToDate) includeItem = includeItem && dayjs(transaction.localDate, "YYYY-MM-DD").isSameOrBefore(dayjs(createToDate, "DD/MM/YYYY"));
        if (amountFrom) includeItem = includeItem && transaction.amount >= amountFrom;
        if (amountTo) includeItem = includeItem && transaction.amount <= amountTo;
        if (merchantId && merchantId.length)  transaction.merchantId = faker.helpers.arrayElement(merchantId) // includeItem = includeItem && merchantId.includes(transaction.merchantId); 
        if (isDcc) includeItem = includeItem && ((isDcc == "AED" && transaction.settlementCurrency == transaction.transactionCurrency) || (isDcc == "Others" && transaction.settlementCurrency != transaction.transactionCurrency));
        if (paymentMethod) includeItem = includeItem && paymentMethod == transaction.paymentMethod;
        if (transactionType && transactionType.length) includeItem = includeItem && transactionType.includes(transaction.transactionType || '');
        if (payoutId) includeItem = includeItem && transaction.payoutId == payoutId;
        if (terminalId && terminalId.length) includeItem = includeItem && terminalId.includes(transaction.terminalId);
        if (referenceNumber) includeItem = includeItem && transaction.referenceNumber == referenceNumber;

        return includeItem;
    })

    const transactionsInThePage = paginateList(filteredTransactions, request.pageSize, request.pageNumber);

    const response: TransactionResponse = {
        metadata: {
            page: request.pageNumber,
            pageCount: Math.ceil(filteredTransactions.length / request.pageSize),
            perPage: request.pageSize,
            totalCount: filteredTransactions.length
        },
        transactions: transactionsInThePage,
    }

    return response;
}