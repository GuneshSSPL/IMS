import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { AuthSidebarComponent } from '../auth-sidebar/auth-sidebar.component';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [FormsModule, RouterModule, AuthSidebarComponent],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  signupData = {
    employeeName: '',
    email: '',
    password: '',
    roleId: 2,
    departmentId: 1
  };
  re_password = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  signup() {
    if (this.signupData.password !== this.re_password) {
      alert('Passwords do not match');
      return;
    }

    // Use regular form submission instead of Observable
    this.authService.register(this.signupData);
    this.router.navigate(['/login']);
  }
}

