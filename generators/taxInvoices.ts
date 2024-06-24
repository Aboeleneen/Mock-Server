import { faker } from "@faker-js/faker";
import _ from "lodash";
import { STORE_IDS } from "../constants";
const { writeFileSync } = require('fs');
import jsonfile from 'jsonfile';
import { paginateList } from "./helpers";
import { TaxInvoice, TaxInvoicesRequest, TaxInvoicesResponse } from "../interfaces/taxInvoice";
import dayjs from "dayjs";

export const generateTaxInvoices = () => {
    const numberOfItems = 500;
    const taxInvoices: TaxInvoice[] = [];
    for (let i = 0; i < numberOfItems; i++) {
        let month = faker.number.int({ min: 1, max: 12 });
        let year = faker.number.int({ min: 2023, max: 2024 });
        taxInvoices.push({
            merchantId: STORE_IDS[faker.number.int({ min: 0, max: STORE_IDS.length - 1 })],
            invoiceNo: faker.string.uuid(),
            date: dayjs(`${year}-${month}-4`).format("MMYYYY"),
            year,
            month,
            totalAmountInclusiveVat: faker.number.float({ min: 1000, max: 10000 }),
            totalVat: faker.number.float({ min: 10, max: 300 }),
            deductionsAmount: faker.number.float({ min: 100, max: 1000 }),
            deductionsVat: faker.number.float({ min: 10, max: 300 }),
            commissionAmount: faker.number.float({ min: 100, max: 10000 }),
            commissionVatInclusive: faker.number.float({ min: 10, max: 300 }),
            refundCommissionAmount: faker.number.float({ min: 100, max: 1000 }),
            refundCommissionVat: faker.number.float({ min: 10, max: 300 }),
            settlementFees: faker.number.float({ min: 100, max: 1000 }),
            currency: 734,
            creationDate: dayjs(`${year}-${month}-4`).format("YYYY-MM-DD")
        })
    }
    writeFileSync("data/tax-invoices.json", JSON.stringify(taxInvoices), 'utf8');

    return taxInvoices;
}

export const getTaxInvoices = async (request: TaxInvoicesRequest): Promise<TaxInvoicesResponse> => {
    let taxInvoicesData: TaxInvoice[] = await jsonfile.readFile('./data/tax-invoices.json');

    taxInvoicesData = taxInvoicesData.filter((invoice: TaxInvoice) => {
        let includeItem = true;
        if (request.invoiceNo) includeItem = includeItem && invoice.invoiceNo.includes(request.invoiceNo || "");
        if (request.year) includeItem = includeItem && invoice.year === request.year;
        if (request.month) includeItem = includeItem && invoice.month === request.month;
        if (request.merchantId && request.merchantId.length) includeItem = includeItem && request.merchantId.includes(invoice.merchantId); //invoice.merchantId = faker.helpers.arrayElement(request.merchantId)
        return includeItem;
    }
    )
    return {
        metadata: {
            page: request.pageNumber,
            perPage: request.pageSize,
            pageCount: Math.round(taxInvoicesData.length / request.pageSize),
            totalCount: taxInvoicesData.length
        },
        vat: paginateList(taxInvoicesData, request.pageSize, request.pageNumber)
    };
}
