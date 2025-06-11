# Vipps Settlement Report Parser

This TypeScript library parses Vipps settlement report CSV files into strongly typed objects.

## Installation

```bash
npm install
npm run build
```

## Usage

```typescript
import { parseSettlementReport } from './dist/parser';

async function main() {
  try {
    const data = await parseSettlementReport('path/to/settlement-report.csv');
    console.log('Organization:', data.organization);
    console.log('Company:', data.company);
    console.log('Settlements:', data.settlements);
    console.log('Fees:', data.fees);
    console.log('Transactions:', data.transactions);
  } catch (error) {
    console.error('Error parsing settlement report:', error);
  }
}

main();
```

## Data Structure

The parser extracts the following data structures:

- `Organization`: Basic organization information
- `Company`: Detailed company information
- `Settlement`: Settlement information including amounts and dates
- `Fee`: Fee-related information
- `Transaction`: Detailed transaction information

Each section is parsed into its respective TypeScript interface, ensuring type safety and data integrity. 