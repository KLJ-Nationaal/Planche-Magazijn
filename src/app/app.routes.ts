import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AddOrderComponent } from './pages/add-order/add-order.component';
import { canActivateAuth } from './auth/auth.guard';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', canActivate: [canActivateAuth], component: DashboardComponent },
  { path: 'add-order', canActivate: [canActivateAuth], component: AddOrderComponent },
  { path: '**', redirectTo: 'login' },
];