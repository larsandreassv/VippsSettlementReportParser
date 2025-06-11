import type { Organization, Company, Settlement, Transaction } from './types';

export interface ParsedData {
    organization: Organization;
    company: Company;
    settlement: Settlement;
    transactions: Transaction[];
}

export class VippsSettlementReportParser {
    private text: string = '';
    private length: number = 0;
    private pos: number = 0;

    public async parse(file: File): Promise<ParsedData> {
        this.text = await file.text();
        this.length = this.text.length;
        this.pos = 0;

        this.skipLine(); // Skip organization header
        const organization: Organization = this.parseOrganizationRow();

        this.skipLine(); // Skip company header
        const company: Company = this.parseCompanyRow();

        this.skipLine(); // Skip settlement header
        const settlement: Settlement = this.parseSettlementRow();

        this.skipLine(); // Skip fee header
        this.skipLine(); // Skip transaction header
        const transactions: Transaction[] = this.parseTransactionRows();

        return { organization, company, settlement, transactions };
    }

    private parseOrganizationRow(): Organization {
        const organization = {
            OrganizationNumber: this.parseField(),
            MerchantName: this.parseField()
        };
        this.skipLine();
        return organization;
    }

    private parseCompanyRow(): Company {
        const company = {
            Name: this.parseField(),
            VisitingAddress: this.parseField(),
            Postbox: this.parseField(),
            Zipno: this.parseField(),
            Place: this.parseField(),
            Country: this.parseField(),
            CompanyNumber: this.parseField()
        };
        this.skipLine();
        return company;
    }

    private parseSettlementRow(): Settlement {
        const firstField = this.parseField();
        if (firstField !== 'SettlementInfo') {
            throw new Error('Expected SettlementInfo line');
        }

        const settlement = {
            SalesUnitName: this.parseField(),
            SaleUnitNumber: this.parseField(),
            SettlementDate: this.parseField(),
            SettlementID: this.parseField(),
            SettlementAccount: this.parseField(),
            Gross: this.toNumber(this.parseField()),
            Currency: this.parseField(),
            Fee: this.toNumber(this.parseField()),
            Refund: this.toNumber(this.parseField()),
            Net: this.toNumber(this.parseField()),
            NumberOfTransactions: parseInt(this.parseField())
        };
        this.skipLine();
        return settlement;
    }

    private parseTransactionRows(): Transaction[] {
        const transactions: Transaction[] = [];

        while (this.pos < this.length) {
            this.parseField(); // Skip the first field (TransactionInfo)
            transactions.push({
                SalesDate: this.parseField(),
                SaleUnitName: this.parseField(),
                SaleUnitNumber: this.parseField(),
                TransactionId: this.parseField(),
                SettlementId: this.parseField(),
                OrderID: this.parseField(),
                SettlementDate: this.parseField(),
                Gross: this.toNumber(this.parseField()),
                Currency: this.parseField(),
                Fee: this.toNumber(this.parseField()),
                Refund: this.toNumber(this.parseField()),
                Net: this.toNumber(this.parseField())
            });
            this.skipLine();
        }

        return transactions;
    }

    // Utility methods
    private toNumber(value: string): number {
        if (!value) return 0;
        return parseFloat(value.replace(/\s/g, '').replace(',', '.'));
    }

    private skipLine() {
        while (this.pos < this.length) {
            const char = this.text[this.pos];
            this.pos++;
            if (char === '\n' || (char === '\r' && this.pos < this.length && this.text[this.pos] === '\n')) {
                if (char === '\r') this.pos++;
                break;
            }
        }
    }

    private parseField(): string {
        let fieldStart = this.pos;
        let value = '';

        while (this.pos < this.length) {
            const char = this.text[this.pos];
            
            // If we hit a comma, we've found the end of the field
            if (char === ',') {
                value = this.text.slice(fieldStart, this.pos).trim();
                this.pos++; // Move past the comma
                return value;
            }
            
            // If we hit a newline, we've found the end of the field and the line
            if (char === '\n' || char === '\r') {
                value = this.text.slice(fieldStart, this.pos).trim();
                return value;
            }
            
            this.pos++;
        }

        // If we reach the end of the file
        return this.text.slice(fieldStart, this.pos).trim();
    }
} 