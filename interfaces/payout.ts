import { MetadataDto } from "./shared";

export interface PayoutsResponse {
    metaData: MetadataDto;
    payouts: Payout[];
}

export interface PayoutsRequest {
    // Pagination
    pageNumber: number;
    pageSize: number;

    // Sorting
    orderBy: string;
    orderByDirection: string;

    // Fields
    createFromDate?: string;
    createToDate?: string;
    merchantId?: string[];
    payoutStatus?: string[];
    netPayoutAmountFrom?: number;
    netPayoutAmountTo?: number;

    // Search Fields
    iban?: string[];
    payoutId?: string;
}

export interface Payout {
    payoutId: string;
    payoutDate: string;
    totalAmount: number;
    netAmount: number;
    totalFeeAmount: number;
    payoutCurrency: string;
    payoutStatus: number;
    merchantId: string;
    merchantIban: string;
    transactionsNumber: number;
}

export interface PayoutsSummaryRequest {
    storeIds: string[];
}