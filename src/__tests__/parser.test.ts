import { VippsSettlementReportParser } from '../parser';
import fs from 'fs';
import path from 'path';

describe('VippsSettlementReportParser', () => {
    let parser: VippsSettlementReportParser;
    let sampleFile: File;

    beforeAll(async () => {
        // Read the sample CSV file
        const filePath = path.join(__dirname, 'fixtures', 'settlement-report.csv');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        
        // Create a File object from the content
        sampleFile = new File(
            [fileContent],
            'settlement-report.csv',
            { type: 'text/csv' }
        );
    });

    beforeEach(() => {
        parser = new VippsSettlementReportParser();
    });

    it('should parse organization data correctly', async () => {
        const result = await parser.parse(sampleFile);
        
        expect(result.organization).toEqual({
            OrganizationNumber: '918713867',
            MerchantName: 'Vipps AS'
        });
    });

    it('should parse company data correctly', async () => {
        const result = await parser.parse(sampleFile);
        
        expect(result.company).toEqual({
            Name: 'Vipps AS',
            VisitingAddress: 'Dronning Eufemias Gate 42',
            Postbox: '',
            Zipno: '0191',
            Place: 'Oslo',
            Country: 'Norway',
            CompanyNumber: '918713867'
        });
    });

    it('should parse settlements correctly', async () => {
        const result = await parser.parse(sampleFile);
        
        expect(result.settlements).toHaveLength(1);
        expect(result.settlements[0]).toEqual({
            SalesUnitName: 'VippsExampleStore',
            SaleUnitNumber: '513428',
            SettlementDate: '12.04.2021',
            SettlementID: '2000001',
            SettlementAccount: '15039794613',
            Gross: 16511.71,
            Currency: 'NOK',
            Fee: -61.09,
            Refund: -1490.00,
            Net: 16450,
            NumberOfTransactions: 62
        });
    });

    it('should parse transactions correctly', async () => {
        const result = await parser.parse(sampleFile);
        
        expect(result.transactions).toHaveLength(7);
        
        // Test first transaction
        expect(result.transactions[0]).toEqual({
            SalesDate: '08.04.2021',
            SaleUnitName: 'VippsExampleStore',
            SaleUnitNumber: '595976',
            TransactionId: '2178112104',
            SettlementId: '2000720',
            OrderID: 'SJKDAIJSFKKJK',
            SettlementDate: '10.04.2021',
            Gross: 2258.00,
            Currency: 'NOK',
            Fee: -8.35,
            Refund: 0.00,
            Net: 2249.65
        });

        // Test refund transaction
        const refundTransaction = result.transactions.find(t => t.Refund < 0);
        expect(refundTransaction).toBeDefined();
        expect(refundTransaction?.Refund).toBe(-1490.00);
    });

    it('should throw error if organization data is missing', async () => {
        const invalidCsv = 'InvalidData,Test\n1,2';
        const invalidFile = new File([invalidCsv], 'invalid.csv', { type: 'text/csv' });
        
        await expect(parser.parse(invalidFile)).rejects.toThrow('Missing required organization or company data');
    });

    it('should handle empty numeric values correctly', async () => {
        const result = await parser.parse(sampleFile);
        
        // Verify all numeric fields are properly parsed
        result.transactions.forEach(transaction => {
            expect(typeof transaction.Gross).toBe('number');
            expect(typeof transaction.Fee).toBe('number');
            expect(typeof transaction.Refund).toBe('number');
            expect(typeof transaction.Net).toBe('number');
            expect(Number.isFinite(transaction.Gross)).toBe(true);
            expect(Number.isFinite(transaction.Fee)).toBe(true);
            expect(Number.isFinite(transaction.Refund)).toBe(true);
            expect(Number.isFinite(transaction.Net)).toBe(true);
        });
    });
}); 