import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account, LoginRequest, RegisterRequest } from '../models/account.model';
import { Transaction, TransferRequest } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // ============ AUTH ============
  login(credentials: LoginRequest): Observable<Account> {
    return this.http.post<Account>(`${this.baseUrl}/accounts/login`, credentials);
  }

  register(data: RegisterRequest): Observable<Account> {
    return this.http.post<Account>(`${this.baseUrl}/accounts/register`, data);
  }

  // ============ ACCOUNTS ============
  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/accounts`);
  }

  getAccount(id: number): Observable<Account> {
    return this.http.get<Account>(`${this.baseUrl}/accounts/${id}`);
  }

  createAccount(account: Account): Observable<Account> {
    return this.http.post<Account>(`${this.baseUrl}/accounts`, account);
  }

  updateAccount(id: number, account: Partial<Account>): Observable<Account> {
    return this.http.put<Account>(`${this.baseUrl}/accounts/${id}`, account);
  }

  disableAccount(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/accounts/disable/${id}`, {});
  }

  enableAccount(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/accounts/enable/${id}`, {});
  }

  // ============ TRANSACTIONS ============
  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.baseUrl}/transactions`);
  }

  deposit(accountId: number, amount: number): Observable<Transaction> {
    const payload = { accountId, amount };
    return this.http.post<Transaction>(
      `${this.baseUrl}/transactions/deposit`,
      payload
    );
  }

  withdraw(accountId: number, amount: number): Observable<Transaction> {
    const payload = { accountId, amount };
    return this.http.post<Transaction>(
      `${this.baseUrl}/transactions/withdraw`,
      payload
    );
  }

  transfer(transaction: TransferRequest): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.baseUrl}/transactions/transfer`, transaction);
  }
}
