import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth'; // Adjust this to match your backend URL

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password });
  }

  register(signupData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, signupData);
  }

  handleAuthCallback(): Observable<any> {
    return this.http.get(`${this.apiUrl}/callback`);
  }
}
