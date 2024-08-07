import { faker } from "@faker-js/faker";
import _ from "lodash";
import { STORE_IDS } from "../constants";
const { writeFileSync } = require('fs');
import { paginateList } from "./helpers";
import { MonthlyStatementReport, MonthlyStatementReportRequest, MonthlyStatementReportResponse } from "../interfaces/monthlyStatementReports";
import dayjs from "dayjs";
import { MONTHLY_STATEMENt_REPORTS } from "./data";

export const generateMonthlyStatementReports = () => {
    const numberOfItems = 500;
    const monthlyStatementReports: MonthlyStatementReport[] = [];
    for (let i = 0; i < numberOfItems; i++) {
        let month = faker.number.int({ min: 1, max: 12 });
        let year = faker.number.int({ min: 2023, max: 2024 });
        monthlyStatementReports.push({
            merchantId: faker.helpers.arrayElement(STORE_IDS),
            reportingMonthYear: dayjs(`${year}-${month}-4`).format("MMYYYY"),
            month,
            year,
            msrDetails: [{
                totalTransactionsAmount: faker.number.int({ min: 100, max: 30000 }),
                currency: 734,
                deductionsNumber: faker.number.int({ min: 10, max: 100 }),
                transactionsNumber: faker.number.int({ min: 10, max: 3000 }),
                payoutsNumber: faker.number.int({ min: 10, max: 300 }),
                totalPayoutsAmount: faker.number.int({ min: 100, max: 30000 })
            }],
            creationDate: dayjs(`${year}-${month}-4`).format("YYYY-MM-DD"),
            msrNo: faker.string.uuid(),
        })
    }
    writeFileSync("data/monthly-statement-reports.json", JSON.stringify(monthlyStatementReports), 'utf8');

    return monthlyStatementReports;
}

export const getMonthlyStatementReports = async (request: MonthlyStatementReportRequest): Promise<MonthlyStatementReportResponse> => {
    const filteredMSR = MONTHLY_STATEMENt_REPORTS.filter((report: MonthlyStatementReport) => {
        let includeItem = true;
        if (request.year) includeItem = includeItem && report.year === request.year;
        if (request.month) includeItem = includeItem && report.month === request.month;
        if (request.merchantId && request.merchantId.length) report.merchantId = faker.helpers.arrayElement(request.merchantId) // includeItem = includeItem && request.merchantId.includes(report.merchantId); 
        return includeItem;
    }
    )
    return {
        metadata: {
            page: request.pageNumber,
            perPage: request.pageSize,
            pageCount: Math.ceil(filteredMSR.length / request.pageSize),
            totalCount: filteredMSR.length
        },
        msr: paginateList(filteredMSR, request.pageSize, request.pageNumber)
    };
}
