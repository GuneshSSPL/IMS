import { Routes } from '@angular/router';
import { LoginComponent } from './MyComponent/login/login.component';
import { SignUpComponent } from './MyComponent/sign-up/sign-up.component';
import { DashboardComponent } from './MyComponent/dashboard/dashboard.component';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';
import { RoleAssignmentComponent } from './MyComponent/master/master.component';
import { ConsumeComponent } from './MyComponent/consume/consume.component';
import { PrintBarcodeComponent } from './MyComponent/printbarcode/printbarcode.component';
import { ReportsComponent } from './MyComponent/reports/reports.component';
import { MaterialTableComponent } from './MyComponent/material-table/material-table.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
{ path: 'auth-callback', component: AuthCallbackComponent },
 { path: 'consume', component: ConsumeComponent, canActivate: [authGuard] },
  { path: 'printbarcode', component: PrintBarcodeComponent, canActivate: [authGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [authGuard] },
  { path: 'material-table', component: MaterialTableComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'dashboard' } // Handle unknown routes
];
