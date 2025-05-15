import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrintBarcodeComponent } from './MyComponent/printbarcode/printbarcode.component';
import { LoginComponent } from './MyComponent/login/login.component';
import { DashboardComponent } from './MyComponent/dashboard/dashboard.component';
import { SignUpComponent } from './MyComponent/sign-up/sign-up.component';
import { authGuard } from './auth.guard'; // Import the authGuard

const routes: Routes = [
  { path: '', component: LoginComponent }, // Or redirectTo: '/login'
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignUpComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard] // Protect the dashboard route
  },
  {
    path: 'printbarcode',
    component: PrintBarcodeComponent,
    canActivate: [authGuard] // Protect the printbarcode route
  },
  // Add canActivate: [authGuard] to any other routes that need protection
  {
    path: '**',
    redirectTo: 'dashboard', // Or '/login' if the user is not authenticated
    canActivate: [authGuard] // Also protect the fallback route if it leads to a protected area
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
