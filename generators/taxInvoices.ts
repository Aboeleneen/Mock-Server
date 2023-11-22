import { faker } from "@faker-js/faker";
import _ from "lodash";
import { STORE_IDS } from "../constants";
const { writeFileSync } = require('fs');
import jsonfile from 'jsonfile';

export interface TaxInvoice {
    invoiceNumber: string;
    vatNumber: string;
    month: number;
    year: number;

    customerName: string;
    country: string;
    city: string;
    address: string;
    phoneNumber: string;
    email: string;

    totalValueOfTransactions: number;
    totalNumberOfTransactions: number;

    totalFee: number;
    totalVat: number;
    deductionVat: number;
    commissionVat: number;
    refundVat: number;
    totalVatFee: number;

    currency: string

    invoiceDate: Date;
    customerVatNumber: string;

    totalCollectionFee: number;
    totalCollectionVatFee: number;
    totalSubscriptionVatFee: number;
    totalChargeRefundVatFee: number;
    totalCollectionVat: number;
    totalSubscriptionFee: number;
    totalSubscriptionVat: number;
    totalChargeRefundFee: number;
    totalChargeRefundVat: number;
    storeId: string;
}

export interface TaxInvoicesResponse {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalInvoices: number;
    vatList: TaxInvoice[];
}

export interface TaxInvoicesRequest {
    pageNumber: number;
    pageSize: number;
    sortOrder: "Desc" | "Asc";
    sortBy: "DateTime" | "CommissionVat";
    storeIds: string[];
    invoiceNumber: string;
    taxYear: number;
    taxMonth: number;
}

export const generateTaxInvoices = () => {
    const numberOfItems = 500;
    const taxInvoices: TaxInvoice[] = [];
    for (let i = 0; i < numberOfItems; i++) {
        let month = faker.number.int({ min: 1, max: 12 });
        let year = faker.number.int({ min: 2022, max: 2023 });
        taxInvoices.push({
            storeId: STORE_IDS[faker.number.int({ min: 0, max: STORE_IDS.length - 1 })],
            invoiceNumber: faker.string.uuid(),
            vatNumber: faker.string.uuid(),
            month,
            year,
            customerName: faker.person.fullName(),
            country: faker.location.country(),
            city: faker.location.city(),
            address: faker.location.streetAddress(),
            phoneNumber: faker.phone.number(),
            email: faker.internet.email(),

            totalValueOfTransactions: faker.number.float({ min: 10, max: 300 }),
            totalNumberOfTransactions: faker.number.int({ min: 10, max: 300 }),

            totalFee: faker.number.float({ min: 10, max: 300 }),
            totalVat: faker.number.float({ min: 10, max: 300 }),
            deductionVat: faker.number.float({ min: 10, max: 300 }),
            commissionVat: faker.number.float({ min: 10, max: 300 }),
            refundVat: faker.number.float({ min: 10, max: 300 }),
            totalVatFee: faker.number.float({ min: 10, max: 300 }),

            currency: "AED",

            invoiceDate: new Date(`${year}-${month}-${faker.number.int({ min: 2, max: 30 })}`),
            customerVatNumber: faker.string.uuid(),

            totalCollectionFee: faker.number.float({ min: 10, max: 300 }),
            totalCollectionVatFee: faker.number.float({ min: 10, max: 300 }),
            totalSubscriptionVatFee: faker.number.float({ min: 10, max: 300 }),
            totalChargeRefundVatFee: faker.number.float({ min: 10, max: 300 }),
            totalCollectionVat: faker.number.float({ min: 10, max: 300 }),
            totalSubscriptionFee: faker.number.float({ min: 10, max: 300 }),
            totalSubscriptionVat: faker.number.float({ min: 10, max: 300 }),
            totalChargeRefundFee: faker.number.float({ min: 10, max: 300 }),
            totalChargeRefundVat: faker.number.float({ min: 10, max: 300 }),
        })
    }
    writeFileSync("data/tax-invoices.json", JSON.stringify(taxInvoices), 'utf8');

    return taxInvoices;
}

export const getTaxInvoices = async (request: TaxInvoicesRequest) => {
    let taxInvoicesData: TaxInvoice[] = await jsonfile.readFile('./data/tax-invoices.json');
    if (request.sortBy === "CommissionVat") {
        taxInvoicesData.sort((a: TaxInvoice, b: TaxInvoice) => {
            if (request.sortOrder === 'Asc') {
                return a.commissionVat - b.commissionVat;
            } else {
                return b.commissionVat - a.commissionVat;
            }
        })
    } else {
        taxInvoicesData.sort((a: TaxInvoice, b: TaxInvoice) => {
            if (request.sortOrder === 'Asc') {
                return new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime();
            } else {
                return new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime();
            }
        })
    }
    taxInvoicesData = taxInvoicesData.filter((invoice: TaxInvoice) => {
        let includeItem = true;
        if (request.invoiceNumber) includeItem = includeItem && invoice.invoiceNumber.includes(request.invoiceNumber || "");
        if (request.taxYear) includeItem = includeItem && new Date(invoice.invoiceDate).getFullYear() === request.taxYear;
        if (request.taxMonth) includeItem = includeItem && (new Date(invoice.invoiceDate).getMonth() + 1) === request.taxMonth;
        if (request.storeIds) includeItem = includeItem && request.storeIds.includes(invoice.storeId);
        return includeItem;
    }
    )
    return { totalPages: Math.round(taxInvoicesData.length / request.pageSize), totalInvoices: taxInvoicesData.length, taxInvoices: taxInvoicesData.slice(0, 10) };
}
