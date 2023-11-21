export const TRANSACTION_STATUSES = [
    "Authorized", "Captured", "Voided", "InProgress", "Paid", "Reversed", "PreAuthorized",
    "Pending", "ForcedReconciliation", "SettledToGeidea", "ReconciliationDone", "ReconciliationInitiated",
    "SettledToMerchant", "ManuallyPaid", "PaidByBnpl", "PaidInAdvance", "PaidToPaymentInAdvance",
    "PartialRefundDone", "PartialRefundInitiated", "ExcessiveRefundDone", "ExcessiveRefundInitiated",
    "FullRefundDone", "FullRefundInitiated", "Failed", "Expired", "Reversed", "RolledBack", "Purchased"
];

export const PAYMENT_TYPES = ["TERMINAL", "WEB", "Online"];

export const CURRENCIES = ["USD", "SAR", "AED"]

export const PATMENT_METHODS = ["Online", "Terminal"]

export const SCHEME_TYPES = ["Visa", "Mastercard", "AMEX", "JCB", "Diners", "CUP", "Mercury"]

export const DYNAMIC_CURRENCY_COVERSION = ["OriginalCurrency", "ForeignCurrency"]

export const PAYOUTS_STATUSES = ["Pending", "Processed", "Rejected"]