import { faker } from "@faker-js/faker";
import _ from "lodash";
import { STORE_IDS } from "../constants";
const { writeFileSync } = require('fs');
import jsonfile from 'jsonfile';
import { paginateList } from "./helpers";

export interface TaxInvoice {
    invoiceNumber: string;
    month: number;
    year: number;

    totalValueOfTransactions: number;
    totalNumberOfTransactions: number;

    totalAmount: number;
    totalVat: number;
    deducationsAmount: number;
    deductionsVat: number;
    commissionAmout: number;
    commissionVat: number;
    refundAmount: number;
    refundVat: number;
    settlementFees: number;
    currency: string
    invoiceDate: Date;
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
        let year = faker.number.int({ min: 2023, max: 2024 });
        taxInvoices.push({
            storeId: STORE_IDS[faker.number.int({ min: 0, max: STORE_IDS.length - 1 })],
            invoiceNumber: faker.string.uuid(),
            month,
            year,
            totalValueOfTransactions: faker.number.float({ min: 10, max: 300 }),
            totalNumberOfTransactions: faker.number.int({ min: 10, max: 300 }),
            totalAmount: faker.number.float({ min: 1000, max: 10000 }),
            totalVat: faker.number.float({ min: 10, max: 300 }),
            deducationsAmount: faker.number.float({ min: 100, max: 1000 }),
            deductionsVat: faker.number.float({ min: 10, max: 300 }),
            commissionAmout: faker.number.float({ min: 100, max: 10000 }),
            commissionVat: faker.number.float({ min: 10, max: 300 }),
            refundAmount: faker.number.float({ min: 100, max: 1000 }),
            refundVat: faker.number.float({ min: 10, max: 300 }),
            settlementFees: faker.number.float({ min: 100, max: 1000 }),
            currency: "AED",

            invoiceDate: new Date(`${year}-${month}-${faker.number.int({ min: 2, max: 30 })}`)
        })
    }
    writeFileSync("data/tax-invoices.json", JSON.stringify(taxInvoices), 'utf8');

    return taxInvoices;
}

export const getTaxInvoices = async (request: TaxInvoicesRequest) => {
    let taxInvoicesData: TaxInvoice[] = await jsonfile.readFile('./data/tax-invoices.json');
    taxInvoicesData.sort((a: TaxInvoice, b: TaxInvoice) => {
        if (request.sortOrder === 'Asc') {
            return new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime();
        } else {
            return new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime();
        }
    })

    taxInvoicesData = taxInvoicesData.filter((invoice: TaxInvoice) => {
        let includeItem = true;
        if (request.invoiceNumber) includeItem = includeItem && invoice.invoiceNumber.includes(request.invoiceNumber || "");
        if (request.taxYear) includeItem = includeItem && new Date(invoice.invoiceDate).getFullYear() === request.taxYear;
        if (request.taxMonth) includeItem = includeItem && (new Date(invoice.invoiceDate).getMonth() + 1) === request.taxMonth;
        if (request.storeIds && request.storeIds.length) includeItem = includeItem && request.storeIds.includes(invoice.storeId);
        return includeItem;
    }
    )
    return { totalPages: Math.round(taxInvoicesData.length / request.pageSize), totalInvoices: taxInvoicesData.length, taxInvoices: paginateList(taxInvoicesData, request.pageSize, request.pageNumber) };
}
