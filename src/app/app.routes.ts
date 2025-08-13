import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AddOrderComponent } from './pages/add-order/add-order.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'add-order', component: AddOrderComponent },
];