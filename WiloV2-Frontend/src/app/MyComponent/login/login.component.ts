import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment'; // Ensure this is imported
import { AuthSidebarComponent } from '../auth-sidebar/auth-sidebar.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    AuthSidebarComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    if (!this.credentials.email || !this.credentials.password) {
      alert('Please fill in all fields');
      return;
    }

    this.authService.login(this.credentials.email, this.credentials.password)
      .subscribe({
        next: (response: { token: string }) => {
          localStorage.setItem('token', response.token);
          this.router.navigate(['/dashboard']);
        },
        error: (error: { error: { message: any } }) => {
          alert('Login failed: ' + (error.error?.message || 'Unknown error'));
        }
      });
  }

  loginWithAuth0() {
    // The callbackUrl here is the one Auth0 will redirect to *after* it authenticates the user.
    // This URL must be registered in your Auth0 Application's "Allowed Callback URLs".
    const auth0CallbackUrl = encodeURIComponent('http://localhost:5000/auth/auth0/callback');
    
    // Redirect to your backend's route that initiates the Auth0 flow.
    // Note: The path is /auth/auth0, not /api/auth/auth0
    // environment.apiUrl should be 'http://localhost:5000'
    window.location.href = `${environment.apiUrl}/auth/auth0?redirect_uri=${auth0CallbackUrl}`;
  }

  loginWithGithub() {
    window.location.href = `${environment.apiUrl}/auth/github`;
  }

  loginWithLinkedIn() {
    window.location.href = `${environment.apiUrl}/auth/linkedin`;
  }
}
