import { Component, OnInit, inject, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CourseDialogComponent } from '../dialogs/course-dialog/course-dialog.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TruncatePipe } from '../../../pipes/truncate.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { CoursesService } from '../../../services/courses.service'; // Adjust path if necessary
import { Course } from '../../../models/course.model'; // Adjust path if necessary
import { User } from '../../../models/user.model'; // Adjust path if necessary
import { selectCurrentUser } from '../../../store/auth/auth.selectors'; // Adjust path if necessary
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-teacher-course-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    TruncatePipe,
    PageHeaderComponent
  ],
  templateUrl: './teacher-course-management.component.html',
  styleUrls: ['./teacher-course-management.component.css']
})
export class TeacherCourseManagementComponent implements OnInit {
  // Corrected 'name' to 'title' to match the Course model
  displayedColumns: string[] = ['title', 'description', 'actions'];
  private store = inject(Store);
  private coursesService = inject(CoursesService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // Renamed to 'courses' to reflect that it holds all courses now
  courses = signal<Course[]>([]);
  isLoading = signal<boolean>(true);
  deletingCourseId = signal<number | null>(null);
  errorMessage = signal<string | null>(null);

  // Made public to be accessible from the template
  currentUser: User | null = null;

  constructor() { }

  ngOnInit(): void {
    // Get the current user to check for ownership in the template
    this.store.select(selectCurrentUser).pipe(take(1)).subscribe(user => {
      if (user) {
        this.currentUser = user as User;
        this.loadCourses(); // Load all courses
      } else {
        this.errorMessage.set('User is not logged in.');
        this.isLoading.set(false);
      }
    });
  }

  // Renamed to loadCourses and removed filtering
  loadCourses(): void {
    this.isLoading.set(true);
    this.coursesService.getCourses().subscribe({
      next: (allCourses) => {
        this.courses.set(allCourses); // Set all courses without filtering
        this.isLoading.set(false);
      },
      error: (err) => this.handleLoadError(err)
    });
  }

  private handleLoadError(err: any): void {
    console.error('Error loading courses:', err);
    this.errorMessage.set('Failed to load courses. Please try again later.');
    this.isLoading.set(false);
  }

  addCourse(): void {
    this.openCourseDialog();
  }

  editCourse(course: Course): void {
    this.openCourseDialog(course);
  }

  deleteCourse(course: Course): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Course Deletion',
        message: `Are you sure you want to delete the course "${course.title}"? This action will also delete all associated lessons.`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.deletingCourseId.set(course.id);
        this.coursesService.deleteCourse(course.id).subscribe({
          next: () => {
            // Update the signal after successful deletion
            this.courses.update(courses => courses.filter(c => c.id !== course.id));
            this.showSnackBar('Course deleted successfully');
          },
          error: (err) => {
            this.showSnackBar('Error deleting course.', true);
            console.error('Error deleting course:', err);
          },
          complete: () => {
            this.deletingCourseId.set(null);
          }
        });
      }
    });
  }

  private showSnackBar(message: string, isError = false): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar']
    });
  }

  openCourseDialog(course?: Course): void {
    const dialogRef = this.dialog.open(CourseDialogComponent, {
      width: '450px',
      data: { course },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      if (course) {
        // Edit mode - a server request does not return the updated object,
        // so we manually update the local object for UI reactivity.
        this.coursesService.updateCourse(course.id, result).subscribe({
          next: () => {
            this.courses.update(courses =>
              courses.map(c => c.id === course.id ? { ...c, ...result } : c)
            );
            this.showSnackBar('Course updated successfully');
          },
          error: (err) => {
            this.showSnackBar('Error updating course.', true);
            console.error('Error updating course:', err);
          }
        });
      } else {
        // Create mode
        if (!this.currentUser?.id) {
          this.showSnackBar('Error: Teacher ID not found.', true);
          return;
        }
        const newCourseData = { ...result, teacherId: this.currentUser.id };
        this.coursesService.createCourse(newCourseData).subscribe({
          next: (newCourse: Course) => {
            this.courses.update(courses => [...courses, newCourse]);
            this.showSnackBar('Course created successfully');
          },
          error: (err) => {
            this.showSnackBar('Error creating course.', true);
            console.error('Error creating course:', err);
          }
        });
      }
    });
  }

  manageLessons(courseId: number): void {
    this.router.navigate(['/teacher/courses', courseId, 'lessons']);
  }
}
