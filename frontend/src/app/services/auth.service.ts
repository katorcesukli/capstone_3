import { Injectable } from '@angular/core';
import { Account } from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private sessionKey = 'loggedUser';

  constructor() {}

  saveUser(user: Account): void {
    localStorage.setItem(this.sessionKey, JSON.stringify(user));
  }

  getUser(): Account | null {
    const user = localStorage.getItem(this.sessionKey);
    return user ? JSON.parse(user) : null;
  }

  updateUser(user: Account): void {
    this.saveUser(user);
  }

  isLoggedIn(): boolean {
    return this.getUser() !== null;
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role?.toUpperCase() === 'ADMIN';
  }

  isCustomer(): boolean {
    const user = this.getUser();
    return user?.role?.toUpperCase() === 'CUSTOMER';
  }

  logout(): void {
    localStorage.removeItem(this.sessionKey);
  }
}
