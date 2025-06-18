import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { Course } from '../../../../models/course.model';

@Component({
  selector: 'app-course-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './course-dialog.component.html',
  styleUrls: ['./course-dialog.component.css']
})
export class CourseDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<CourseDialogComponent>);
  public data: { course?: Course } = inject(MAT_DIALOG_DATA);

  courseForm!: FormGroup;
  isSaving = signal(false);

  ngOnInit(): void {
    this.courseForm = this.fb.group({
      title: [this.data.course?.title || '', Validators.required],
      description: [this.data.course?.description || '', Validators.required]
    });
  }

  onSave(): void {
    if (this.courseForm.invalid || this.isSaving()) {
      return;
    }
    this.isSaving.set(true);
    // The actual save logic will be handled by the component opening this dialog.
    // We just pass back the form value.
    this.dialogRef.close(this.courseForm.value);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
