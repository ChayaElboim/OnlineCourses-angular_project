import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { LessonDialogComponent } from '../dialogs/lesson-dialog/lesson-dialog.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

import { CoursesService } from '../../../services/courses.service';
import { LessonsService } from '../../../services/lessons.service';
import { Course } from '../../../models/course.model';
import { Lesson } from '../../../models/lesson.model';

@Component({
  selector: 'app-lesson-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './lesson-management.component.html',
  styleUrls: ['./lesson-management.component.css']
})
export class LessonManagementComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private coursesService = inject(CoursesService);
  private lessonsService = inject(LessonsService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  course = signal<Course | null>(null);
  lessons = signal<Lesson[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  deletingLessonId = signal<number | null>(null);
  displayedColumns: string[] = ['title', 'actions'];

  private courseId!: number;

  ngOnInit(): void {
    const courseIdParam = this.route.snapshot.paramMap.get('courseId');
    if (courseIdParam) {
      this.courseId = +courseIdParam;
      this.loadInitialData();
    } else {
      this.errorMessage.set('לא נמצא מזהה קורס.');
      this.isLoading.set(false);
    }
  }

  loadInitialData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.coursesService.getCourseById(this.courseId).subscribe({
      next: (courseData) => {
        this.course.set(courseData);
        this.loadLessons();
      },
      error: (err) => {
        this.errorMessage.set('שגיאה בטעינת פרטי הקורס.');
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }

  loadLessons(): void {
    this.lessonsService.getLessonsForCourse(this.courseId).subscribe({
      next: (lessonsData) => {
        this.lessons.set(lessonsData);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('שגיאה בטעינת רשימת השיעורים.');
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }

  addLesson(): void {
    const dialogRef = this.dialog.open(LessonDialogComponent, {
      width: '450px',
      data: { courseId: this.courseId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Lesson created, refreshing list...');
        this.loadLessons();
      }
    });
  }

  editLesson(lesson: Lesson): void {
    const dialogRef = this.dialog.open(LessonDialogComponent, {
      width: '450px',
      data: { lesson: lesson, courseId: this.courseId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Lesson updated, refreshing list...');
        this.loadLessons();
      }
    });
  }

  private showSnackBar(message: string, isError = false): void {
    this.snackBar.open(message, 'סגור', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar']
    });
  }

  deleteLesson(lesson: Lesson): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'אישור מחיקת שיעור',
        message: `האם אתה בטוח שברצונך למחוק את השיעור "${lesson.title}"?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.deletingLessonId.set(lesson.id);
        this.lessonsService.deleteLesson(this.courseId, lesson.id).subscribe({
          next: () => {
            this.showSnackBar('השיעור נמחק בהצלחה');
            this.loadLessons();
          },
          error: (err) => {
            this.showSnackBar('שגיאה במחיקת השיעור.', true);
            console.error('Error deleting lesson:', err);
            this.deletingLessonId.set(null);
          },
          complete: () => {
            this.deletingLessonId.set(null);
          }
        });
      }
    });
  }
}
