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
        const organization: Organization = this.parseOrganization();

        this.skipLine(); // Skip company header
        const company: Company = this.parseCompany();

        this.skipLine(); // Skip settlement header
        const settlement: Settlement = this.parseSettlement();

        this.skipLine(); // Skip fee header
        this.skipLine(); // Skip transaction header
        const transactions: Transaction[] = this.parseTransactions();

        return { organization, company, settlement, transactions };
    }

    private parseOrganization(): Organization {
        const organization = {
            OrganizationNumber: this.getField(0),
            MerchantName: this.getField(1)
        };
        this.skipLine();
        return organization;
    }

    private parseCompany(): Company {
        const company = {
            Name: this.getField(0),
            VisitingAddress: this.getField(1),
            Postbox: this.getField(2),
            Zipno: this.getField(3),
            Place: this.getField(4),
            Country: this.getField(5),
            CompanyNumber: this.getField(6)
        };
        this.skipLine();
        return company;
    }

    private parseSettlement(): Settlement {
        const firstField = this.getField(0);
        if (firstField !== 'SettlementInfo') {
            throw new Error('Expected SettlementInfo line');
        }

        const settlement = {
            SalesUnitName: this.getField(1),
            SaleUnitNumber: this.getField(2),
            SettlementDate: this.getField(3),
            SettlementID: this.getField(4),
            SettlementAccount: this.getField(5),
            Gross: this.parseNumber(this.getField(6)),
            Currency: this.getField(7),
            Fee: this.parseNumber(this.getField(8)),
            Refund: this.parseNumber(this.getField(9)),
            Net: this.parseNumber(this.getField(10)),
            NumberOfTransactions: parseInt(this.getField(11))
        };
        this.skipLine();
        return settlement;
    }

    private parseTransactions(): Transaction[] {
        const transactions: Transaction[] = [];

        while (this.pos < this.length) {
            transactions.push({
                SalesDate: this.getField(1),
                SaleUnitName: this.getField(2),
                SaleUnitNumber: this.getField(3),
                TransactionId: this.getField(4),
                SettlementId: this.getField(5),
                OrderID: this.getField(6),
                SettlementDate: this.getField(7),
                Gross: this.parseNumber(this.getField(8)),
                Currency: this.getField(9),
                Fee: this.parseNumber(this.getField(10)),
                Refund: this.parseNumber(this.getField(11)),
                Net: this.parseNumber(this.getField(12))
            });
            this.skipLine();
        }

        return transactions;
    }

    // Utility methods
    private parseNumber(value: string): number {
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

    private findLineEnd(): number {
        let end = this.pos;
        while (end < this.length) {
            const char = this.text[end];
            if (char === '\n' || char === '\r') {
                break;
            }
            end++;
        }
        return end;
    }

    private getField(fieldIndex: number): string {
        const lineEnd = this.findLineEnd();
        let currentField = 0;
        let fieldStart = this.pos;

        for (let i = this.pos; i < lineEnd; i++) {
            if (this.text[i] === ',') {
                if (currentField === fieldIndex) {
                    return this.text.slice(fieldStart, i).trim();
                }
                currentField++;
                fieldStart = i + 1;
            }
        }

        // Last field
        if (currentField === fieldIndex) {
            return this.text.slice(fieldStart, lineEnd).trim();
        }

        return '';
    }
} 