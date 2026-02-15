import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  regData = { username: '', password: '' };
  errorMessage = '';
  isSubmitting = false;

  constructor(private apiService: ApiService, private router: Router) {}

  register(): void {
    // Validation
    if (this.regData.username.length < 3) {
      this.errorMessage = 'Username must be at least 3 characters.';
      return;
    }

    if (this.regData.password.length < 4) {
      this.errorMessage = 'Password must be at least 4 characters.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload = {
      username: this.regData.username,
      password: this.regData.password,
      role: 'CUSTOMER'
    };

    this.apiService.register(payload).subscribe({
      next: () => {
        alert('Registration successful! You can now log in.');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Registration Error:', error);
        if (error.status === -1) {
          this.errorMessage = 'Server unreachable. Check if Spring Boot is running.';
        } else if (error.status === 400 || error.status === 409) {
          this.errorMessage =
            error.error?.message || 'Username is already taken.';
        } else {
          this.errorMessage = 'Registration failed. Try a different username.';
        }
        this.isSubmitting = false;
      }
    });
  }

  clearError(): void {
    this.errorMessage = '';
  }
}
