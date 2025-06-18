// src/app/models/auth-response.ts
export interface AuthResponse {
  token: string;
  userId: number;
  role: string;
  
    // message?: string; // יכול להיות שדה הודעה במקרה של הצלחה או כישלון
    // error?: string;   // יכול להיות שדה שגיאה במקרה של כישלון
}