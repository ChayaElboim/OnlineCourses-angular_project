import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../store/auth/auth.selectors'; // Adjust path if necessary
import { map, take } from 'rxjs/operators';

export const teacherGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  console.log('[TeacherGuard] Checking access...'); // Log: Guard is running

  return store.select(selectCurrentUser).pipe(
    take(1), // Ensure the observable completes after one emission
    map(user => {
      console.log('[TeacherGuard] Current user from store:', JSON.stringify(user, null, 2)); // Log: User object from store

      if (user && user.role === 'teacher') {
        console.log('[TeacherGuard] Access granted. User is a teacher.'); // Log: Access granted
        return true;
      } else {
        console.log('[TeacherGuard] Access denied. User is not a teacher or not logged in.'); // Log: Access denied
        router.navigate(['/login']); // Redirect to login page
        return false;
      }
    })
  );
};
