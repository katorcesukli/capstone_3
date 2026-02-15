import { Account } from './account.model';

export interface Transaction {
  id: number;
  transfer_amount: number;
  sourceAccount?: Account;
  destinationAccount?: Account;
  date: string;
}

export interface TransferRequest {
  transfer_amount: number;
  sourceAccount: { id: number };
  destinationAccount: { id: number };
}
