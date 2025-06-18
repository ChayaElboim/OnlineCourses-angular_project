import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lesson } from '../models/lesson.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LessonsService {
  private http = inject(HttpClient);
  // The API endpoint for lessons is nested under courses
  private apiUrl = `${environment.apiUrl}/courses`;

  getLessonsForCourse(courseId: number): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.apiUrl}/${courseId}/lessons`);
  }

  createLesson(courseId: number, lessonData: { title: string; content: string }): Observable<Lesson> {
    return this.http.post<Lesson>(`${this.apiUrl}/${courseId}/lessons`, lessonData);
  }

  updateLesson(courseId: number, lessonId: number, lessonData: { title: string; content: string }): Observable<Lesson> {
    return this.http.put<Lesson>(`${this.apiUrl}/${courseId}/lessons/${lessonId}`, lessonData);
  }

  deleteLesson(courseId: number, lessonId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${courseId}/lessons/${lessonId}`);
  }
}
