import { createReducer, on } from '@ngrx/store';
import { initialAuthState, AuthState } from './auth.state';
import * as AuthActions from './auth.actions';

export const authReducer = createReducer(
  initialAuthState,
  on(AuthActions.loginSuccess, (state, { user, token }) => {
    return {
      ...state,
      isLoggedIn: true,
      user: user,
      token: token,
      error: null
    };
  }),
  on(AuthActions.registerSuccess, (state, { user, token }) => ({
    ...state,
    isLoggedIn: true,
    user: user,
    token: token,
    error: null
  })),
  on(AuthActions.logout, (state) => ({
    ...state,
    user: null,
    isLoggedIn: false, // Correct property name
    token: null,
    error: null
  }))
);

export function reducer(state: AuthState | undefined, action: any) {
  return authReducer(state, action);
}