import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { AuthResponse } from '../models/auth-response';
import { Store } from '@ngrx/store';
import * as AuthActions from '../store/auth/auth.actions';
import { selectCurrentUser, selectIsAuthenticated } from '../store/auth/auth.selectors';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`; // Changed from /api/users to /api/auth

  constructor(private http: HttpClient, private store: Store) { }

  register(user: User): Observable<AuthResponse> {
    console.log('Attempting registration for:', user);
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, user)
      .pipe(
        tap(response => {
          console.log('Registration successful', response);
          localStorage.setItem('authToken', response.token);
          this.store.dispatch(AuthActions.registerSuccess({ user: { id: response.userId, role: response.role }, token: response.token }));
        }),
        catchError(this.handleError<AuthResponse>('register'))
      );
  }

  login(credentials: { email: string, password: string }): Observable<AuthResponse> {
    console.log('Attempting login for:', credentials.email);
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          // This is the critical part: handle success inside the service
          // to ensure token is set before any other request is made.
          localStorage.setItem('authToken', response.token);
          this.store.dispatch(AuthActions.loginSuccess({ 
            user: { id: response.userId, role: response.role }, 
            token: response.token 
          }));
        }),
        catchError(this.handleError<AuthResponse>('login'))
      );
  }

  logout(): void {
    console.log('Logging out');
    localStorage.removeItem('authToken');
    this.store.dispatch(AuthActions.logout());
  }

  isLoggedIn(): Observable<boolean> {
    return this.store.select(selectIsAuthenticated);
  }

  getLoggedInUser(): Observable<{ id: string | number | null; role: string | null; } | null> {
    return this.store.select(selectCurrentUser);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      console.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}