import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(() => {

        this.router.navigate(['/courses']);
      })
    ),
    { dispatch: false } // This effect does not dispatch a new action
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(async () => {
        // First, navigate away from any protected routes to destroy components.
        await this.router.navigate(['/login']);
        // THEN, remove the token. This prevents a race condition.
        localStorage.removeItem('authToken');
      })
    ),
    { dispatch: false }
  );

  constructor(private actions$: Actions, private router: Router) {}
}
