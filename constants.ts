export const TRANSACTION_STATUSES = [
    "Pending", "Captured", "Voided", "InProgress", "Paid", "Reversed", "PreAuthorized",
    "Pending", "ForcedReconciliation", "SettledToGeidea", "ReconciliationDone", "ReconciliationInitiated",
    "SettledToMerchant", "ManuallyPaid", "PaidByBnpl", "PaidInAdvance", "PaidToPaymentInAdvance",
    "PartialRefundDone", "PartialRefundInitiated", "ExcessiveRefundDone", "ExcessiveRefundInitiated",
    "FullRefundDone", "FullRefundInitiated", "Failed", "Expired", "Reversed", "RolledBack", "Purchased"
];

export const TRANSACTION_TYPES = ["Purchase", "Purchase Reversal", "Refund", "Refund Reversal", "Auth Purchase"];

export const CURRENCIES = ["USD", "AED"]

export const PATMENT_METHODS = ["Online", "Terminal"]

export const SCHEME_TYPES = ["VI", "MI","ME", "UP", "AX", "JC", "DI", "RU", "TM", "TB"]

export const DYNAMIC_CURRENCY_COVERSION = ["OriginalCurrency", "ForeignCurrency"]

export const PAYOUTS_STATUSES = ["Pending", "Processed", "Rejected"]

export const STORE_IDS = [
    "101000000021001",
    "101000000021002", 
    "B10100000222", 
    "B10100000218", 
    "B10100000045", 
    "B10100000040",
    "B10100000046"
];

export const TAX_AVAILABLE_YEARS = [2022, 2023];

export const TICKET_STATUS = ["pending", "done", "cancelled"];
