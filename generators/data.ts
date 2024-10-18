import { readFileSync, writeFileSync } from "jsonfile";
import { existsSync } from "fs"; // Import existsSync to check file existence

// Function to create a file if it doesn't exist
const createFileIfNotExists = (filePath: string, defaultContent: object) => {
    if (!existsSync(filePath)) {
        writeFileSync(filePath, defaultContent);
        console.log(`Created ${filePath}`);
    }
};

import { Transaction } from "../interfaces/transaction";
import { MonthlyStatementReport } from "../interfaces/monthlyStatementReports";
import { TaxInvoice } from "../interfaces/taxInvoice";

export const TRANSACTIONS: Transaction[] = readFileSync('./data/transactions.json');
console.log(`Loading ${TRANSACTIONS.length} transactions`);
export const PAYOUTS = readFileSync('./data/payouts.json');
console.log(`Loading ${PAYOUTS.length} payouts`);
export const MONTHLY_STATEMENt_REPORTS: MonthlyStatementReport[] = readFileSync('./data/monthly-statement-reports.json');
console.log(`Loading ${MONTHLY_STATEMENt_REPORTS.length} monthly statement reports`);
export const TAX_INVOICES: TaxInvoice[] = readFileSync('./data/tax-invoices.json');
console.log(`Loading ${TAX_INVOICES.length} tax invoices`);

// Create tickets.json and terminals.json if they don't exist
// createFileIfNotExists('./data/tickets.json', []);
// createFileIfNotExists('./data/terminals.json', []);