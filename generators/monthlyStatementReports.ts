import { faker } from "@faker-js/faker";
import _ from "lodash";
import { STORE_IDS } from "../constants";
const { writeFileSync } = require('fs');
import jsonfile from 'jsonfile';
import { paginateList } from "./helpers";

export interface MonthlyStatementReport {
    msrNo: string;
    month: number;
    year: number;
    currency: string;
    createDate: Date;
    transactionsAmount: number;
    transcationsNumber: number;
    payoutsNumber: number;
    storeId: string;
}

export interface MonthlyStatementReportResponse {
    totalPages: number;
    totalMSRs: number;
    monthlyStatementReports: MonthlyStatementReport[];
}

export interface MonthlyStatementReportRequest {
    pageNumber: number;
    pageSize: number;
    storeIds: string[];
    year: number;
    month: number;
    sortOrder: "Asc" | "Desc"
}

export const generateMonthlyStatementReports = () => {
    const numberOfItems = 500;
    const monthlyStatementReports: MonthlyStatementReport[] = [];
    for (let i = 0; i < numberOfItems; i++) {
        let month = faker.number.int({ min: 1, max: 12 });
        let year = faker.number.int({ min: 2022, max: 2023 });
        monthlyStatementReports.push({
            storeId: faker.helpers.arrayElement(STORE_IDS),
            month,
            year,
            transactionsAmount: faker.number.int({ min: 100, max: 30000 }),
            transcationsNumber: faker.number.int({ min: 10, max: 3000 }),
            currency: "AED",
            createDate: new Date(`${year}-${month}-${faker.number.int({ min: 2, max: 30 })}`),
            msrNo: faker.string.uuid(),
            payoutsNumber: faker.number.int({ min: 100, max: 30000 }),
        })
    }
    writeFileSync("data/monthly-statement-reports.json", JSON.stringify(monthlyStatementReports), 'utf8');

    return monthlyStatementReports;
}

export const getMonthlyStatementReports = async (request: MonthlyStatementReportRequest) => {
    let monthlyStatementReports: MonthlyStatementReport[] = await jsonfile.readFile('./data/monthly-statement-reports.json');
    monthlyStatementReports.sort((a: MonthlyStatementReport, b: MonthlyStatementReport) => {
        if (request.sortOrder === 'Asc') {
            return new Date(a.createDate).getTime() - new Date(b.createDate).getTime();
        } else {
            return new Date(b.createDate).getTime() - new Date(a.createDate).getTime();
        }
    })

    monthlyStatementReports = monthlyStatementReports.filter((report: MonthlyStatementReport) => {
        let includeItem = true;
        if (request.year) includeItem = includeItem && new Date(report.createDate).getFullYear() === request.year;
        if (request.month) includeItem = includeItem && (new Date(report.createDate).getMonth() + 1) === request.month;
        if (request.storeIds) includeItem = includeItem && request.storeIds.includes(report.storeId);
        return includeItem;
    }
    )
    return { totalPages: Math.round(monthlyStatementReports.length / request.pageSize), totalMSRs: monthlyStatementReports.length, monthlyStatementReports: paginateList(monthlyStatementReports, request.pageSize, request.pageNumber) };
}
