import { createFeatureSelector, createSelector } from '@ngrx/store';

import { AuthState } from './auth.state';



export const selectAuthState = createFeatureSelector<AuthState>('auth');



export const selectCurrentUser = createSelector(

selectAuthState,

(state: AuthState) => state.user

);



export const selectIsAuthenticated = createSelector(

selectAuthState,

(state: AuthState) => state.isAuthenticated

);

export const selectAuthToken = createSelector(
  selectAuthState,
  (state: AuthState) => state.token
);