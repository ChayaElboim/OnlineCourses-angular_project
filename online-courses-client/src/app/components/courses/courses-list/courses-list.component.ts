import { Component, OnInit, signal, computed, inject, effect, Signal } from '@angular/core';
import { UsersService } from '../../../services/users.service';
import { CoursesService } from '../../../services/courses.service'; 
import { Course } from '../../../models/course.model';
import { User } from '../../../models/user.model'; 
import { AuthService } from '../../../services/auth.service'; 
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, tap, forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatGridListModule } from '@angular/material/grid-list';

import { HttpErrorResponse } from '@angular/common/http';

export interface DisplayCourse extends Course {
  isEnrolled?: boolean;
}

@Component({
  selector: 'app-courses-list',
  templateUrl: './courses-list.component.html',
  styleUrls: ['./courses-list.component.css'],
  standalone: true,
    imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatGridListModule
  ],
})
export class CoursesListComponent implements OnInit {
  private coursesService = inject(CoursesService);
  private authService = inject(AuthService);
  private usersService = inject(UsersService);

  allCourses = signal<Course[]>([]);
  studentEnrolledCourses = signal<Course[]>([]);
  currentUser: Signal<{ id: string | number | null; role: string | null; } | null | undefined>;
  teacherNamesMap = signal<Map<string, string>>(new Map());

  errorMessage = signal<string | null>(null);
  loading = signal(true);

  processedCourses = computed(() => {
    const courses = this.allCourses();
    const enrolled = this.studentEnrolledCourses();
    const enrolledIds = new Set(enrolled.map(c => c.id));

    return courses.map(course => ({
      ...course,
      isEnrolled: enrolledIds.has(course.id)
    } as DisplayCourse));
  });

  constructor() { 
    this.currentUser = toSignal(this.authService.getLoggedInUser());

    effect(() => {
      const user = this.currentUser();
      if (user !== undefined) {
        setTimeout(() => this.loadInitialData(), 0);
      }
    });
  }

  ngOnInit(): void {
    // Logic is now handled reactively by the effect in the constructor.
  }

  loadInitialData(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    const user = this.currentUser();

    const courses$ = this.coursesService.getCourses();
    const studentCourses$ = (user && user.id)
      ? this.coursesService.getStudentCourses(user.id)
      : of([]);

    forkJoin({
      courses: courses$,
      studentCourses: studentCourses$
    }).pipe(
      tap(({ courses, studentCourses }) => {
        this.allCourses.set(courses);
        this.studentEnrolledCourses.set(studentCourses);
      }),
      switchMap(({ courses }) => {
        const teacherIds = [...new Set(courses.map(course => course.teacherId).filter(id => id != null))];
        if (teacherIds.length === 0) {
          return of([]);
        }
        const teacherRequests = teacherIds.map(id => this.usersService.getUserById(id!));
        return forkJoin(teacherRequests);
      }),
      catchError(err => {
        console.error('DEBUG: Failed to load initial data', err);
        this.errorMessage.set('Failed to load course data.');
        return of([]);
      })
    ).subscribe(teachers => {
      const teacherMap = new Map<string, string>();
      teachers.forEach(teacher => {
        if (teacher && teacher.id) {
          teacherMap.set(String(teacher.id), teacher.name);
        }
      });
      this.teacherNamesMap.set(teacherMap);
      this.loading.set(false);
    });
  }

  private loadStudentCoursesOnly(): void {
    const user = this.currentUser();
    if (user && user.id) {
      this.coursesService.getStudentCourses(user.id).pipe(
        catchError(err => {
          this.errorMessage.set('Failed to reload student courses.');
          return of([]);
        })
      ).subscribe(sCourses => {
        this.studentEnrolledCourses.set(sCourses);
      });
    } else {
      this.studentEnrolledCourses.set([]);
    }
  }

  getTeacherName(teacherId: string | number | null): string {
    if (teacherId === null || teacherId === undefined) return 'N/A';
    return this.teacherNamesMap().get(String(teacherId)) || 'Unknown Teacher';
  }

  enroll(courseId: number): void {
    if (!this.currentUser()?.id) {
      this.errorMessage.set('You must be logged in to enroll.');
      return;
    }
    this.coursesService.enrollInCourse(courseId).subscribe({
      next: () => {
        console.log(`Enrolled in course ${courseId}`);
        this.loadStudentCoursesOnly();
      },
      error: (err) => {
        this.errorMessage.set('Failed to enroll in course.');
      }
    });
  }

  leave(courseId: number): void {
    if (!this.currentUser()?.id) {
      this.errorMessage.set('You must be logged in to leave a course.');
      return;
    }
    this.coursesService.leaveCourse(courseId).subscribe({
      next: () => {
        console.log(`Left course ${courseId}`);
        this.loadStudentCoursesOnly();
      },
      error: (err) => {
        this.errorMessage.set('Failed to leave course.');
      }
    });
  }

  deleteCourse(courseId: number): void {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      this.coursesService.deleteCourse(courseId).subscribe({
        next: () => {
          this.allCourses.update(courses => courses.filter(c => c.id !== courseId));
        },
        error: (err) => {
          this.errorMessage.set('Failed to delete the course.');
        }
      });
    }
  }
}