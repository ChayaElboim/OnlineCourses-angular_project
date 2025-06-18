import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // נתיב לשירות האוטנטיקציה
import { User } from '../../models/user.model'; // נתיב למודל המשתמש
import { AuthResponse } from '../../models/auth-response'; // ייבוא ה-AuthResponse
import { Store } from '@ngrx/store';
import * as AuthActions from '../../store/auth/auth.actions'; 
@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private store: Store
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // אופציונלי: בדיקה אם משתמש כבר מחובר
    this.authService.isLoggedIn().subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.router.navigate(['/courses']);
      }
    });
  }

    login(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/courses']);
        },
        error: (err) => {
          this.errorMessage = 'שגיאה בהתחברות. אנא בדוק את האימייל והסיסמה.';
          console.error('Login failed', err);
        }
      });
    }
  }

    register(): void {
    if (this.registerForm.valid) {
      // Assuming register method in service also logs the user in
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.router.navigate(['/courses']);
        },
        error: (err) => {
          this.errorMessage = 'שגיאה בהרשמה. ייתכן שהאימייל כבר קיים.';
          console.error('Registration failed', err);
        }
      });
    }
  }
}