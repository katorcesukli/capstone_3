import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginData = { username: '', password: '' };
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {
    this.checkSession();
  }

  checkSession(): void {
    if (this.authService.isLoggedIn()) {
      const user = this.authService.getUser();
      if (user?.role?.toUpperCase() === 'ADMIN') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/customer']);
      }
    }
  }

  login(): void {
    if (!this.loginData.username || !this.loginData.password) {
      this.errorMessage = 'Please enter both username and password.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.apiService.login(this.loginData).subscribe({
      next: (user) => {
        this.authService.saveUser(user);
        console.log('Login successful. Role:', user.role);
        if (user.role?.toUpperCase() === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/customer']);
        }
      },
      error: (error) => {
        console.error('Login Error:', error);
        if (error.status === -1) {
          this.errorMessage = 'Cannot connect to server. Is the Backend running?';
        } else if (error.status === 401) {
          this.errorMessage = error.error?.message || 'Invalid username or password.';
        } else {
          this.errorMessage = 'An unexpected error occurred. Please try again.';
        }
        this.isSubmitting = false;
      }
    });
  }
}
