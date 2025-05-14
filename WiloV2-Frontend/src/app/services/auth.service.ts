import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/auth'; // Corrected: Base path for auth routes

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password });
  }

  register(signupData: {
    employeeName: string;
    email: string;
    password: string;
    roleId: number;
    departmentId: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, signupData);
  }

  // The Auth0 flow redirects the user to a frontend URL (e.g., /auth-callback)
  // with the token in the query parameters. The frontend component at that route
  // should extract the token. This method, as an HTTP GET to a backend /callback,
  // doesn't fit that pattern.
  // If you need to *initiate* Auth0 login, you would typically navigate the browser:
  // window.location.href = 'http://localhost:5000/auth/auth0';
  /*
  handleAuthCallback(): Observable<any> {
    // This endpoint (e.g., http://localhost:5000/auth/callback) does not exist
    // in the backend for this purpose. Auth0 callback is handled by passport
    // which then redirects to the frontend with a token.
    return this.http.get(`${this.apiUrl}/callback`);
  }
  */
}
