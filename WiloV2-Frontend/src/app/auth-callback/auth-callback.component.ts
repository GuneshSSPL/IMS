import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Remove AuthService import if it's no longer needed here

@Component({
  selector: 'app-auth-callback',
  template: '<p>Processing authentication, please wait...</p>', // Or any other appropriate template
  // styleUrls: ['./auth-callback.component.css'] // If you have styles
})
export class AuthCallbackComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router
    // If AuthService was injected only to call a method that made the incorrect HTTP request,
    // you can remove it from the constructor.
  ) { }

  ngOnInit(): void {
    // This is where you extract the token from the URL query parameters
    this.route.queryParams.subscribe(params => {
      const token = params['token']; // Assuming the backend redirects with a 'token' query param

      if (token) {
        localStorage.setItem('token', token); // Store the token
        // Navigate to the dashboard or another appropriate page
        this.router.navigate(['/dashboard']);
      } else {
        // Handle the case where the token is missing
        console.error('Auth callback error: Token not found in URL parameters.');
        // Redirect to login page with an error message
        this.router.navigate(['/login'], { queryParams: { error: 'auth_callback_failed_no_token' } });
      }
    });
  }
}
