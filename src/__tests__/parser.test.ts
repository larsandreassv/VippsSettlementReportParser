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
        
        // Create File object from the content
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
            OrganizationNumber: '999888777',
            MerchantName: 'Payment Provider AS'
        });
    });

    it('should parse company data correctly', async () => {
        const result = await parser.parse(sampleFile);
        
        expect(result.company).toEqual({
            Name: 'Payment Provider AS',
            VisitingAddress: 'Example Street 123',
            Postbox: '',
            Zipno: '0191',
            Place: 'Oslo',
            Country: 'Norway',
            CompanyNumber: '999888777'
        });
    });

    it('should parse settlement correctly', async () => {
        const result = await parser.parse(sampleFile);
        
        expect(result.settlement).toEqual({
            SalesUnitName: 'Example Store',
            SaleUnitNumber: '123456',
            SettlementDate: '12.04.2021',
            SettlementID: '2000001',
            SettlementAccount: '12345678901',
            Gross: 16511.71,
            Currency: 'NOK',
            Fee: -61.09,
            Refund: -1490.00,
            Net: 16450.00,
            NumberOfTransactions: 62
        });
    });

    it('should parse transactions correctly', async () => {
        const result = await parser.parse(sampleFile);
        
        expect(result.transactions).toHaveLength(7);
        
        // Test first transaction
        expect(result.transactions[0]).toEqual({
            SalesDate: '08.04.2021',
            SaleUnitName: 'Example Store',
            SaleUnitNumber: '123456',
            TransactionId: 'TX000000001',
            SettlementId: '2000720',
            OrderID: 'ORD000000001',
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

    it('should handle large files efficiently', async () => {
        const startTime = Date.now();
        await parser.parse(sampleFile);
        const endTime = Date.now();
        
        // Parsing should complete in reasonable time (e.g., under 1 second)
        expect(endTime - startTime).toBeLessThan(1000);
    });
}); 