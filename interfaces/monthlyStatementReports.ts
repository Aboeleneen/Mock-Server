import { MetadataDto } from "./shared";

export interface MonthlyStatementReport {
    msrNo: string;
    merchantId: string;
    reportingMonthYear: string;
    month: number;
    year: number;
    msrDetails: MsrDetails[];
    creationDate: string;
}

export interface MsrDetails {
    payoutsNumber: number;
    transactionsNumber: number;
    deductionsNumber: number;
    totalPayoutsAmount: number;
    totalTransactionsAmount: number;
    currency: number;
}

export interface MonthlyStatementReportResponse {
    msr: MonthlyStatementReport[];
    metadata: MetadataDto;
}

export interface MonthlyStatementReportRequest {
    pageNumber: number;
    pageSize: number;
    orderBy: string;
    msrNo: string;
    merchantId: string[];
    year: number;
    month: number | null;
}