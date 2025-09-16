import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AddOrderComponent } from './pages/add-order/add-order.component';
import { canActivateAuth, redirectIfAuthenticated } from './auth/auth.guard';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [
  { path: 'login', canMatch: [redirectIfAuthenticated], component: LoginComponent },
  { path: '', 
    canMatch: [canActivateAuth],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'add-order', component: AddOrderComponent },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: 'dashboard' },
];