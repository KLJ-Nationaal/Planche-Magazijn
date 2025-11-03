import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AddOrderComponent } from './pages/add-order/add-order.component';
import { canActivateAuth, redirectIfAuthenticated } from './auth/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { EditOrderComponent } from './pages/edit-order/edit-order.component';

export const routes: Routes = [
  { path: 'login', canMatch: [redirectIfAuthenticated], component: LoginComponent },
  { path: '', 
    canMatch: [canActivateAuth],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'add-order', component: AddOrderComponent },
      { path: 'edit-order/:id', component: EditOrderComponent },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: 'dashboard' },
];