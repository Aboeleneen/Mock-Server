import { MetadataDto } from "./shared";

export interface Transaction {
    terminalId: string;
    merchantId: string;
    payoutId: string;
    exchangeRate?: number;

    netAmount: number;
    amount: number;
    settlementAmount?: number;
    settlementCurrency?: number;
    transactionCurrency: number;

    referenceNumber: string;
    cardProduct: string;
    paymentStatus: number;
    localDate: string;
    localTime: number;
    commissionAmount?: number;
    paymentMethod: string;
    transactionType?: string;

    GrossAmount: string;
    LastUpdatedDate?: Date;
    CustomerEmail: string;
    PhoneNumber: string;
    OrderId: string;
    VAT?: number;
    CashbackAmount?: number;
    PaymentLinkNumber: string;
    CardHolderName: string;
    MaskedCardNumber: string;
    CardExpiryDate?: Date;
    TerminalName: string;
    TerminalLocation: string;
    PayoutStatus: string;
    PayoutSettlementAmount?: number;
    PayoutPaymentDate?: Date;
    InstallmentBank: string;
    InstallmentType: string;
    Tenor: string;
    InstallmentDiscountRate?: number;
}

export interface TransactionResponse {
    metadata: MetadataDto;
    transactions: Transaction[];
}

export interface TransactionRequest {
    // Pagination
    pageNumber: number;
    pageSize: number;

    // Sorting
    orderBy?: string;
    orderByDirection?: string;

    // Search Fields
    referenceNumber?: string;
    payoutId?: string;
    terminalId: string[];

    // Filters
    merchantId?: string[];
    createFromDate?: string;
    createToDate?: string;
    amountFrom?: number;
    amountTo?: number;
    scheme?: string[];
    isDcc?: string;
    paymentMethod?: string;
    transactionType?: string[];
    paymentStatus?: number[];
}