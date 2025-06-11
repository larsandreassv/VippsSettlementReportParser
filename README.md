# Vipps Settlement Report Parser

A TypeScript parser for Vipps settlement report CSV files. This parser processes settlement reports and extracts structured data including organization details, company information, settlements, fees, and transactions.

## Features

- Parses Vipps settlement report CSV files into strongly typed data structures
- Handles numeric values with proper decimal parsing
- Supports different sections of the settlement report:
  - Organization information
  - Company details
  - Settlement records
  - Fee information
  - Transaction records
- Comprehensive error handling
- Full TypeScript support

## Installation

```bash
npm install
```

## Usage

```typescript
import { VippsSettlementReportParser } from './src/parser';

// Create a new parser instance
const parser = new VippsSettlementReportParser();

// Parse a settlement report file
const file = new File(['...csv content...'], 'settlement-report.csv', { type: 'text/csv' });
const result = await parser.parse(file);

// Access the parsed data
console.log(result.organization);  // Organization details
console.log(result.company);       // Company information
console.log(result.settlements);   // Settlement records
console.log(result.fees);         // Fee records
console.log(result.transactions); // Transaction records
```

## Data Structure

The parser returns data in the following structure:

```typescript
interface ParsedData {
    organization: Organization;    // Organization details
    company: Company;             // Company information
    settlements: Settlement[];    // List of settlements
    fees: Fee[];                 // List of fees
    transactions: Transaction[]; // List of transactions
}
```

### Organization
```typescript
interface Organization {
    OrganizationNumber: string;
    MerchantName: string;
}
```

### Company
```typescript
interface Company {
    Name: string;
    VisitingAddress: string;
    Postbox: string;
    Zipno: string;
    Place: string;
    Country: string;
    CompanyNumber: string;
}
```

### Settlement
```typescript
interface Settlement {
    SalesUnitName: string;
    SaleUnitNumber: string;
    SettlementDate: string;
    SettlementID: string;
    SettlementAccount: string;
    Gross: number;
    Currency: string;
    Fee: number;
    Refund: number;
    Net: number;
    NumberOfTransactions: number;
}
```

### Transaction
```typescript
interface Transaction {
    SalesDate: string;
    SaleUnitName: string;
    SaleUnitNumber: string;
    TransactionId: string;
    SettlementId: string;
    OrderID: string;
    SettlementDate: string;
    Gross: number;
    Currency: string;
    Fee: number;
    Refund: number;
    Net: number;
}
```

## Development

### Setup
```bash
npm install
```

### Running Tests
```bash
npm test           # Run tests once
npm test:watch    # Run tests in watch mode
```

### Project Structure
```
src/
├── parser.ts              # Main parser implementation
├── types/                 # Type definitions
│   └── index.ts
└── __tests__/            # Test files
    ├── fixtures/         # Test data
    │   └── settlement-report.csv
    └── parser.test.ts    # Parser tests
```

## Error Handling

The parser will throw an error in the following cases:
- Missing required organization or company data
- Invalid CSV format
- Invalid numeric values

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 