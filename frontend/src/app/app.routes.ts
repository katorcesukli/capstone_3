import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AdminComponent } from './components/admin/admin.component';
import { CustomerComponent } from './components/customer/customer.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { role: ['ADMIN'] }
  },
  {
    path: 'customer',
    component: CustomerComponent,
    canActivate: [AuthGuard],
    data: { role: ['CUSTOMER'] }
  },
  { path: '**', redirectTo: '/login' }
];
