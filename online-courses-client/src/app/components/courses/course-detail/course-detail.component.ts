import { Component, OnInit, signal, WritableSignal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CoursesService } from '../../../services/courses.service';
import { UsersService } from '../../../services/users.service'; 
import { Course } from '../../../models/course.model'; 
import { Lesson } from '../../../models/lesson.model'; 
// User model might be needed if we type teacher explicitly, but service handles it for now
import { HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngrx/store'; // For NgRx Store
import { selectCurrentUser } from '../../../store/auth/auth.selectors'; // Path to your selector
import { User } from '../../../models/user.model'; // Path to your User model
import { RouterLink } from '@angular/router'; // For routerLink directive
@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule,RouterLink], 
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.css']
})
export class CourseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private coursesService = inject(CoursesService);
  private usersService = inject(UsersService); 
  private store = inject(Store);

  courseId: WritableSignal<number | null> = signal(null);
  course: WritableSignal<Course | null> = signal(null);
  lessons: WritableSignal<Lesson[]> = signal([]);
  teacherName: WritableSignal<string | null> = signal(null); 
  isLoading: WritableSignal<boolean> = signal(false);
  errorMessage: WritableSignal<string | null> = signal(null);
  currentUserSignal = this.store.selectSignal(selectCurrentUser);

  // Signals to track completion of fetch operations
  private courseDetailsFetchCompleted: WritableSignal<boolean> = signal(false);
  private lessonsFetchCompleted: WritableSignal<boolean> = signal(false);

  hasCourseId = computed(() => this.courseId() !== null);

  constructor() {
    // Effect to orchestrate data fetching when courseId changes
    effect(() => {
      const id = this.courseId();
      if (id !== null) {
        this.isLoading.set(true);
        this.errorMessage.set(null);
        this.course.set(null);
        this.lessons.set([]);
        this.teacherName.set(null);
        this.courseDetailsFetchCompleted.set(false);
        this.lessonsFetchCompleted.set(false);

        this.fetchCourseAndTeacherDetails(id);
        this.fetchLessons(id);
      }
    }, { allowSignalWrites: true });

    // Effect to set isLoading to false when all fetches are complete
    effect(() => {
      if (this.courseDetailsFetchCompleted() && this.lessonsFetchCompleted()) {
        this.isLoading.set(false);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.courseId.set(+idParam); 
      } else {
        this.errorMessage.set('Course ID not found in URL.');
        this.courseId.set(null);
        this.isLoading.set(false); // No ID, so not loading anything
      }
    });
  }

  private fetchCourseAndTeacherDetails(id: number): void {
    this.coursesService.getCourseById(id).subscribe({
      next: (courseData) => {
        this.course.set(courseData);
        if (courseData && courseData.teacherId) {
          this.usersService.getUserById(courseData.teacherId).subscribe({
            next: (teacherData) => {
              this.teacherName.set(teacherData.name);
              this.courseDetailsFetchCompleted.set(true);
            },
            error: (teacherErr: HttpErrorResponse) => {
              console.error('Error fetching teacher details:', teacherErr);
              this.teacherName.set(null); // Or 'Unknown Teacher'
              // Optionally update global error message for teacher fetch failure
              this.errorMessage.update(prevMsg => (prevMsg ? prevMsg + ' ' : '') + 'Failed to load teacher details.');
              this.courseDetailsFetchCompleted.set(true); // Attempt is complete even on error
            }
          });
        } else {
          this.teacherName.set(null); // No teacherId
          this.courseDetailsFetchCompleted.set(true);
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching course details:', err);
        this.errorMessage.set(`Failed to load course details. ${err.status === 404 ? 'Course not found.' : 'Server error.'}`);
        this.course.set(null);
        this.courseDetailsFetchCompleted.set(true); // Attempt is complete even on error
      }
    });
  }

  private fetchLessons(courseId: number): void {
    this.coursesService.getLessonsByCourseId(courseId).subscribe({
      next: (data) => {
        this.lessons.set(data);
        this.lessonsFetchCompleted.set(true);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching lessons:', err);
        this.errorMessage.update(prevMsg => (prevMsg ? prevMsg + ' ' : '') + 'Failed to load lessons.');
        this.lessons.set([]); // Set to empty on error
        this.lessonsFetchCompleted.set(true); // Attempt is complete even on error
      }
    });
  }
}
