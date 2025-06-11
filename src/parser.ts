import type { Organization, Company, Settlement, Fee, Transaction } from './types';

export interface ParsedData {
    organization: Organization;
    company: Company;
    settlements: Settlement[];
    fees: Fee[];
    transactions: Transaction[];
}

enum ParserState {
    INITIAL = 'INITIAL',
    ORGANIZATION = 'ORGANIZATION',
    COMPANY = 'COMPANY',
    SETTLEMENT = 'SETTLEMENT',
    FEE = 'FEE',
    TRANSACTION = 'TRANSACTION'
}

interface ParserContext {
    state: ParserState;
    organization?: Organization;
    company?: Company;
    settlements: Settlement[];
    fees: Fee[];
    transactions: Transaction[];
    nextLineIsData: boolean;
}

export class VippsSettlementReportParser {
    private context: ParserContext;

    constructor() {
        this.context = this.createInitialContext();
    }

    private createInitialContext(): ParserContext {
        return {
            state: ParserState.INITIAL,
            settlements: [],
            fees: [],
            transactions: [],
            nextLineIsData: false
        };
    }

    private parseNumber(value: string): number {
        if (!value) return 0;
        // Remove any thousand separators and replace comma with dot for decimal
        return parseFloat(value.replace(/\s/g, '').replace(',', '.'));
    }

    private parseOrganization(values: string[]): Organization {
        return {
            OrganizationNumber: values[0],
            MerchantName: values[1]
        };
    }

    private parseCompany(values: string[]): Company {
        return {
            Name: values[0],
            VisitingAddress: values[1],
            Postbox: values[2],
            Zipno: values[3],
            Place: values[4],
            Country: values[5],
            CompanyNumber: values[6]
        };
    }

    private parseSettlement(values: string[]): Settlement {
        return {
            SalesUnitName: values[1],
            SaleUnitNumber: values[2],
            SettlementDate: values[3],
            SettlementID: values[4],
            SettlementAccount: values[5],
            Gross: this.parseNumber(values[6]),
            Currency: values[7],
            Fee: this.parseNumber(values[8]),
            Refund: this.parseNumber(values[9]),
            Net: this.parseNumber(values[10]),
            NumberOfTransactions: parseInt(values[11])
        };
    }

    private parseFee(values: string[]): Fee {
        return {
            SettlementDate: values[1],
            SaleUnitName: values[2],
            SaleUnitNumber: values[3],
            FeeAccount: values[4],
            Fee: this.parseNumber(values[5]),
            Currency: values[6]
        };
    }

    private parseTransaction(values: string[]): Transaction {
        return {
            SalesDate: values[1],
            SaleUnitName: values[2],
            SaleUnitNumber: values[3],
            TransactionId: values[4],
            SettlementId: values[5],
            OrderID: values[6],
            SettlementDate: values[7],
            Gross: this.parseNumber(values[8]),
            Currency: values[9],
            Fee: this.parseNumber(values[10]),
            Refund: this.parseNumber(values[11]),
            Net: this.parseNumber(values[12])
        };
    }

    private transitionState(values: string[]): ParserState | null {
        const firstValue = values[0];
        switch (firstValue) {
            case 'OrganizationNumber': 
                this.context.nextLineIsData = true;
                return ParserState.ORGANIZATION;
            case 'Name': 
                this.context.nextLineIsData = true;
                return ParserState.COMPANY;
            case 'SettlementInfo': 
                if (values[1] === 'SalesUnitName') {
                    this.context.nextLineIsData = false;
                    return ParserState.SETTLEMENT;
                }
                return null;
            case 'FeeInfo': 
                this.context.nextLineIsData = false;
                return ParserState.FEE;
            case 'TransactionInfo': 
                if (values[1] === 'SalesDate') {
                    this.context.nextLineIsData = false;
                    return ParserState.TRANSACTION;
                }
                return null;
            default: return null;
        }
    }

    private processLine(values: string[]): void {
        // Check for state transitions
        const newState = this.transitionState(values);
        if (newState !== null) {
            this.context.state = newState;
            return;
        }

        // Process data based on current state
        switch (this.context.state) {
            case ParserState.ORGANIZATION:
                if (this.context.nextLineIsData) {
                    this.context.organization = this.parseOrganization(values);
                    this.context.nextLineIsData = false;
                }
                break;

            case ParserState.COMPANY:
                if (this.context.nextLineIsData) {
                    this.context.company = this.parseCompany(values);
                    this.context.nextLineIsData = false;
                }
                break;

            case ParserState.SETTLEMENT:
                if (values[0] === 'SettlementInfo') {
                    this.context.settlements.push(this.parseSettlement(values));
                }
                break;

            case ParserState.FEE:
                if (values[0] === 'FeeInfo' && values[1] !== 'SettlementDate') {
                    this.context.fees.push(this.parseFee(values));
                }
                break;

            case ParserState.TRANSACTION:
                if (values[0] === 'TransactionInfo' && values[1] !== 'SalesDate') {
                    this.context.transactions.push(this.parseTransaction(values));
                }
                break;
        }
    }

    private validateParsedData(): void {
        if (!this.context.organization || !this.context.company) {
            throw new Error('Missing required organization or company data');
        }
    }

    public async parse(file: File): Promise<ParsedData> {
        this.context = this.createInitialContext();
        
        const text = await file.text();
        const lines = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
        
        for (const line of lines) {
            const values = line.split(',');
            this.processLine(values);
        }

        this.validateParsedData();

        return {
            organization: this.context.organization!,
            company: this.context.company!,
            settlements: this.context.settlements,
            fees: this.context.fees,
            transactions: this.context.transactions
        };
    }
} 