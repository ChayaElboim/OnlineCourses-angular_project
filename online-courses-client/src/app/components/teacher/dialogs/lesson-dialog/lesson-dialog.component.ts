import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Lesson } from '../../../../models/lesson.model';
import { LessonsService } from '../../../../services/lessons.service';

@Component({
  selector: 'app-lesson-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './lesson-dialog.component.html',
  styleUrls: ['./lesson-dialog.component.css']
})
export class LessonDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private lessonsService = inject(LessonsService);
  private dialogRef = inject(MatDialogRef<LessonDialogComponent>);
  private snackBar = inject(MatSnackBar);
  public data: { lesson?: Lesson, courseId: number } = inject(MAT_DIALOG_DATA);

  lessonForm!: FormGroup;
  isEditMode = false;
  isSaving = signal(false);

  ngOnInit(): void {
    this.isEditMode = !!this.data.lesson;
    this.lessonForm = this.fb.group({
      title: [this.data.lesson?.title || '', Validators.required],
      content: [this.data.lesson?.content || '', Validators.required]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.lessonForm.invalid || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    const formValue = this.lessonForm.value;
    const courseId = this.data.courseId;

    const operation = this.isEditMode
      ? this.lessonsService.updateLesson(courseId, this.data.lesson!.id, formValue)
      : this.lessonsService.createLesson(courseId, formValue);

    operation.subscribe({
      next: () => {
        this.showSnackBar('השיעור נשמר בהצלחה');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error saving lesson:', err);
        this.showSnackBar('שגיאה בשמירת השיעור. נסה שוב.', true);
        this.isSaving.set(false);
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
}
