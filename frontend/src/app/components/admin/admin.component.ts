import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Account } from '../../models/account.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  accounts: Account[] = [];
  transactions: any[] = [];
  newAccount = { username: '', password: '', role: 'CUSTOMER', balance: 0 };
  transferData = { sourceId: null, destinationId: null, amount: 0 };
  searchUser = '';
  accPage = 0;
  txPage = 0;
  showEditModal = false;
  editingAcc: any = {};
  modalData: any = { username: '', password: '', role: '', balance: null };
  errorMessage = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
    this.loadTransactions();
  }

  adminLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  loadAccounts(): void {
    this.apiService.getAccounts().subscribe({
      next: (data) => {
        this.accounts = data;
      },
      error: (err) => {
        console.error('Error loading accounts', err);
      }
    });
  }

  loadTransactions(): void {
    this.apiService.getTransactions().subscribe({
      next: (data) => {
        this.transactions = data;
      },
      error: (err) => {
        console.error('Error loading transactions', err);
      }
    });
  }

  createAccount(): void {
    const accountToCreate = { ...this.newAccount, role: this.newAccount.role.toUpperCase() };

    this.apiService.createAccount(accountToCreate as any).subscribe({
      next: () => {
        alert('Account created successfully!');
        this.newAccount = { username: '', password: '', role: 'CUSTOMER', balance: 0 };
        this.loadAccounts();
      },
      error: (err) => {
        alert('Creation failed: ' + this.parseError(err));
      }
    });
  }

  openEditModal(acc: Account): void {
    this.editingAcc = acc;
    this.modalData = { username: '', password: '', role: '', balance: null };
    this.showEditModal = true;
  }

  closeModal(): void {
    this.showEditModal = false;
    this.editingAcc = {};
  }

  saveModalEdit(): void {
    const updatedAccount = {
      username: this.modalData.username?.trim() ? this.modalData.username : this.editingAcc.username,
      password: this.modalData.password?.trim() ? this.modalData.password : this.editingAcc.password,
      role: this.modalData.role?.trim() ? this.modalData.role.toUpperCase() : this.editingAcc.role,
      balance: this.modalData.balance !== null && this.modalData.balance !== undefined
        ? parseFloat(this.modalData.balance)
        : this.editingAcc.balance
    };

    this.apiService.updateAccount(this.editingAcc.id, updatedAccount).subscribe({
      next: () => {
        alert('Account updated successfully!');
        this.closeModal();
        this.loadAccounts();
      },
      error: (err) => {
        alert('Update failed: ' + this.parseError(err));
      }
    });
  }

  deleteAccount(id: number): void {
    if (!confirm('Are you sure? This will disable the account and sanitize sensitive data.')) return;

    this.apiService.disableAccount(id).subscribe({
      next: () => {
        alert('Account disabled successfully!');
        this.loadAccounts();
      },
      error: (err) => {
        alert('Action failed: ' + this.parseError(err));
      }
    });
  }

  enableAccount(id: number): void {
    if (!confirm('Reactivate this account?')) return;

    this.apiService.enableAccount(id).subscribe({
      next: () => {
        alert('Account reactivated successfully!');
        this.loadAccounts();
      },
      error: (err) => {
        alert('Enable failed: ' + this.parseError(err));
      }
    });
  }

  transferMoney(): void {
    if (!this.transferData.sourceId || !this.transferData.destinationId) {
      alert('Please select both accounts.');
      return;
    }
    if (this.transferData.sourceId === this.transferData.destinationId) {
      alert('Cannot transfer to the same account!');
      return;
    }

    const transaction = {
      transfer_amount: this.transferData.amount,
      sourceAccount: { id: this.transferData.sourceId },
      destinationAccount: { id: this.transferData.destinationId }
    };

    this.apiService.transfer(transaction).subscribe({
      next: () => {
        alert('Transfer successful!');
        this.transferData = { sourceId: null, destinationId: null, amount: 0 };
        this.loadAccounts();
        this.loadTransactions();
      },
      error: (err) => {
        alert('Transfer failed: ' + this.parseError(err));
      }
    });
  }

  private parseError(err: any): string {
    if (!err.error) return 'Connection Error';
    return typeof err.error === 'string' ? err.error : (err.error.message || JSON.stringify(err.error));
  }

  get filteredAccounts(): Account[] {
    return this.accounts.filter(acc => acc.username.includes(this.searchUser));
  }
}
