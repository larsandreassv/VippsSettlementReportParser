export interface Organization {
  OrganizationNumber: string;
  MerchantName: string;
}

export interface Company {
  Name: string;
  VisitingAddress: string;
  Postbox: string;
  Zipno: string;
  Place: string;
  Country: string;
  CompanyNumber: string;
}

export interface Settlement {
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

export interface Fee {
  SettlementDate: string;
  SaleUnitName: string;
  SaleUnitNumber: string;
  FeeAccount: string;
  Fee: number;
  Currency: string;
}

export interface Transaction {
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
