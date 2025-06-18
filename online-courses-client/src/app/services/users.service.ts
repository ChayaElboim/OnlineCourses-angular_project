import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../models/user.model'; // ודא שהנתיב למודל User נכון

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = `${environment.apiUrl}/users`; // בסיס ה-URL ל-API של המשתמשים

  constructor(private http: HttpClient) { }

  // מתודה לקבלת משתמש לפי ID
  getUserById(id: number | string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('An error occurred in UsersService:', error);
    // אפשר להוסיף לוגיקה מורכבת יותר לטיפול בשגיאות, כמו שליחת השגיאה לשרת לוגים
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}
