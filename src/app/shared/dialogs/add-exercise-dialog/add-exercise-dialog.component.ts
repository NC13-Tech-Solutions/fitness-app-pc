import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Exercise } from '../../models/exercise.model';

@Component({
  selector: 'app-add-exercise-dialog',
  templateUrl: './add-exercise-dialog.component.html',
  styleUrls: ['./add-exercise-dialog.component.sass'],
})
export class AddExerciseDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AddExerciseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public inputData: Exercise[]
  ) {}

  addExerciseOutput(passedInfo: { data: Exercise; submit: boolean }) {
    this.dialogRef.close(passedInfo);
  }
}
