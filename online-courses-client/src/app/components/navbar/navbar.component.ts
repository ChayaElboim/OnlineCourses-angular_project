import { Component, OnInit, signal, WritableSignal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../store/auth/auth.actions';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private store = inject(Store);

  isLoggedIn: WritableSignal<boolean> = signal(false);
  isTeacher: WritableSignal<boolean> = signal(false);

  ngOnInit(): void {
    this.authService.getLoggedInUser().subscribe(user => {
      if (user && user.id) {
        this.isLoggedIn.set(true);
        this.isTeacher.set(user.role === 'teacher');
      } else {
        this.isLoggedIn.set(false);
        this.isTeacher.set(false);
      }
    });
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}

