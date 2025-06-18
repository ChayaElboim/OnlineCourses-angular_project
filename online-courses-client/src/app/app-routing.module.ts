import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoursesListComponent } from './components/courses/courses-list/courses-list.component'; // ייתכן שהנתיב שלך שונה
import { AuthComponent } from './components/auth/auth.component'; // נוסיף ייבוא עבור AuthComponent
import { CourseDetailComponent } from './components/courses/course-detail/course-detail.component'; // ייבוא הקומפוננטה החדשה
import { TeacherCourseManagementComponent } from './components/teacher/teacher-course-management/teacher-course-management.component'; // Import the new component
import { teacherGuard } from './guards/teacher.guard'; // Import the guard
import { LessonManagementComponent } from './components/teacher/lesson-management/lesson-management.component';

const routes: Routes = [
  { path: '', component: AuthComponent }, // נתיב השורש יוביל ל-AuthComponent
  { path: 'login', component: AuthComponent }, // נתיב /login יוביל גם הוא ל-AuthComponent
  { path: 'courses', component: CoursesListComponent },
  { path: 'courses/:id', component: CourseDetailComponent }, // הנתיב החדש לפרטי קורס
  {
    path: 'teacher/manage-courses', // Or any path you prefer e.g., 'teacher/dashboard'
    component: TeacherCourseManagementComponent,
    canActivate: [teacherGuard] // Protect this route
  },
  {
    path: 'teacher/courses/:courseId/lessons',
    component: LessonManagementComponent,
    canActivate: [teacherGuard] // Protect this route
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }