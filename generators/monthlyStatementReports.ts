import { faker } from "@faker-js/faker";
import _ from "lodash";
import { STORE_IDS } from "../constants";
const { writeFileSync } = require('fs');
import jsonfile from 'jsonfile';
import { paginateList } from "./helpers";
import { MonthlyStatementReport, MonthlyStatementReportRequest, MonthlyStatementReportResponse } from "../interfaces/monthlyStatementReports";
import dayjs from "dayjs";

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
    let monthlyStatementReports: MonthlyStatementReport[] = await jsonfile.readFile('./data/monthly-statement-reports.json');

    monthlyStatementReports = monthlyStatementReports.filter((report: MonthlyStatementReport) => {
        let includeItem = true;
        if (request.year) includeItem = includeItem && report.year === request.year;
        if (request.month) includeItem = includeItem && report.month === request.month;
        if (request.merchantId && request.merchantId.length) includeItem = includeItem && request.merchantId.includes(report.merchantId); //report.merchantId = faker.helpers.arrayElement(request.merchantId)
        return includeItem;
    }
    )
    return {
        metadata: {
            page: request.pageNumber,
            perPage: request.pageSize,
            pageCount: Math.round(monthlyStatementReports.length / request.pageSize),
            totalCount: monthlyStatementReports.length
        },
        msr: paginateList(monthlyStatementReports, request.pageSize, request.pageNumber)
    };
}
