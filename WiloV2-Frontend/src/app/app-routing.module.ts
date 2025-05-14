import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrintBarcodeComponent } from './MyComponent/printbarcode/printbarcode.component';
import { LoginComponent } from './MyComponent/login/login.component';
import { DashboardComponent } from './MyComponent/dashboard/dashboard.component';
import { SignUpComponent } from './MyComponent/sign-up/sign-up.component';


const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'printbarcode', component: PrintBarcodeComponent },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
