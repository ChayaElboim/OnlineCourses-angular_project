export interface AuthState {
    user: { id: string | number | null; role: string | null } | null;
    isAuthenticated: boolean;
    token: string | null;
  }
  
  export const initialAuthState: AuthState = {
    user: null,
    isAuthenticated: false,
    token: null
  };