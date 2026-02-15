import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Account } from '../../models/account.model';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  user: Account | null = null;
  accounts: Account[] = [];
  transactions: Transaction[] = [];
  transferData = { amount: 0, sourceId: 0, destId: null };
  depositData = { amount: 0 };
  withdrawData = { amount: 0 };

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {
    const loggedUser = this.authService.getUser();
    if (!loggedUser) {
      this.router.navigate(['/login']);
    } else {
      this.user = loggedUser;
      this.transferData.sourceId = loggedUser.id;
    }
  }

  ngOnInit(): void {
    this.loadAccounts();
    this.loadTransactions();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  loadAccounts(): void {
    this.apiService.getAccounts().subscribe({
      next: (data) => {
        if (this.user) {
          this.accounts = data.filter(acc => acc.id !== this.user!.id);
        }
      },
      error: (err) => {
        console.error('Failed to load accounts', err);
      }
    });
  }

  depositMoney(): void {
    if (!this.depositData.amount || this.depositData.amount <= 0) {
      alert('Please enter a valid amount to deposit.');
      return;
    }

    if (!this.user) return;

    this.apiService.deposit(this.user.id, this.depositData.amount).subscribe({
      next: () => {
        alert('Deposit successful!');
        this.depositData.amount = 0;
        this.updateDashboard();
        this.loadTransactions();
      },
      error: (err) => {
        alert('Deposit failed: ' + (err.error || 'Server Error'));
      }
    });
  }

  withdrawMoney(): void {
    if (!this.withdrawData.amount || this.withdrawData.amount <= 0) {
      alert('Please enter a valid amount to withdraw.');
      return;
    }

    if (!this.user || this.withdrawData.amount > this.user.balance) {
      alert('Insufficient funds! Your current balance is ₱' + this.user?.balance);
      return;
    }

    this.apiService.withdraw(this.user.id, this.withdrawData.amount).subscribe({
      next: () => {
        alert('Withdrawal successful!');
        this.withdrawData.amount = 0;
        this.updateDashboard();
        this.loadTransactions();
      },
      error: (err) => {
        alert('Withdrawal failed: ' + (err.error || 'Server Error'));
      }
    });
  }

  transferMoney(): void {
    if (!this.transferData.amount || this.transferData.amount <= 0) {
      alert('Enter a valid amount to transfer.');
      return;
    }

    if (!this.transferData.destId) {
      alert('Please select a recipient account.');
      return;
    }

    if (!this.user) return;

    const transaction = {
      transfer_amount: this.transferData.amount,
      sourceAccount: { id: this.user.id },
      destinationAccount: { id: this.transferData.destId }
    };

    this.apiService.transfer(transaction).subscribe({
      next: () => {
        alert('Transfer successful!');
        this.transferData.amount = 0;
        this.transferData.destId = null;
        this.updateDashboard();
        this.loadTransactions();
      },
      error: (err) => {
        alert('Transfer failed: ' + (err.error || 'Check your balance or recipient ID'));
      }
    });
  }

  updateDashboard(): void {
    if (!this.user) return;

    this.apiService.getAccount(this.user.id).subscribe({
      next: (data) => {
        this.user = data;
        this.authService.updateUser(data);
      }
    });
  }

  loadTransactions(): void {
    if (!this.user) return;

    this.apiService.getTransactions().subscribe({
      next: (data) => {
        this.transactions = data.filter(tx => {
          const isSource = tx.sourceAccount && tx.sourceAccount.id === this.user!.id;
          const isDest = tx.destinationAccount && tx.destinationAccount.id === this.user!.id;
          return isSource || isDest;
        });
      },
      error: (err) => {
        console.error('Failed to load transactions', err);
      }
    });
  }

  getTransactionType(tx: Transaction): string {
    if (!this.user) return '';
    if (tx.sourceAccount?.id === this.user.id && tx.destinationAccount) {
      return 'Transfer Sent';
    } else if (tx.destinationAccount?.id === this.user.id && tx.sourceAccount) {
      return 'Transfer Received';
    } else if (!tx.sourceAccount) {
      return 'Deposit';
    } else if (!tx.destinationAccount) {
      return 'Withdrawal';
    }
    return '';
  }

  getTransactionDetails(tx: Transaction): string {
    if (!this.user) return '';
    if (tx.sourceAccount?.id === this.user.id && tx.destinationAccount) {
      return `To: ${tx.destinationAccount.username}`;
    } else if (tx.destinationAccount?.id === this.user.id && tx.sourceAccount) {
      return `From: ${tx.sourceAccount.username}`;
    }
    return 'Self-Action';
  }

  getTransactionSign(tx: Transaction): string {
    if (!this.user) return '';
    return tx.sourceAccount?.id === this.user.id ? '-' : '+';
  }
}
