import { MetadataDto } from "./shared";

export interface TaxInvoicesRequest {
    pageNumber: number;
    pageSize: number;
    orderBy: string;
    merchantId: string[];
    invoiceNo: string;
    year: string;
    month: string | null;
}

export interface TaxInvoice {
    invoiceNo: string;
    merchantId: string;
    date: string;
    month: number;
    year: number;
    creationDate: string;
    commissionAmount: number;
    commissionVatInclusive: number;
    deductionsAmount: number;
    deductionsVat: number;
    refundCommissionAmount: number;
    refundCommissionVat: number;
    totalAmountInclusiveVat: number;
    totalVat: number;
    settlementFees: number;
    currency: number;
}

export interface TaxInvoicesResponse {
    vat: TaxInvoice[];
    metadata: MetadataDto;
}
