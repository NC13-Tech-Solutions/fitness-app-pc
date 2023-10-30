import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Observable, take } from 'rxjs';
import { ExerciseService } from '../services/http/exercise.service';
import { Exercise } from '../shared/models/exercise.model';
import { Mode } from '../shared/models/mode.model';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MiscDataType } from '../shared/models/misc-data-type.model';

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.sass'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ExercisesComponent {
  private router = inject(Router);
  private snackbar = inject(MatSnackBar);

  private exerciseService = inject(ExerciseService);

  public exercises: Observable<Exercise[]> = this.exerciseService
    .getAllExercises()
    .pipe(take(1));

  public mode: Mode = Mode.VIEW;
  exerciseMode = Mode;
  editExerciseData: Exercise | undefined;

  close_nav() {
    this.router.navigateByUrl('/main');
  }

  addExercise() {
    this.editExerciseData = undefined;
    this.mode = Mode.ADD;
  }

  editExercise(value: Exercise) {
    this.editExerciseData = value;
    this.mode = Mode.EDIT;
  }

  addOrEditExercise(value: { data: Exercise; submit: boolean }) {
    if (value.submit) {
      if (this.mode == Mode.ADD) {
        this.exerciseService
          .addExercise(value.data)
          .pipe(take(1))
          .subscribe((result) => {
            if (result == 1) {
              this.editExerciseData = undefined;
              this.mode = Mode.VIEW;
              this.snackbar.open('Exercise Added', 'Dismiss', {
                duration: 5000,
              });
            } else if (result == 0) {
              this.snackbar.open('Exercise already exists', 'Got it', {
                duration: 5000,
              });
            }
          });
      } else if (this.mode == Mode.EDIT) {
        this.exerciseService
          .editExercise(value.data)
          .pipe(take(1))
          .subscribe((result) => {
            if (result == 1) {
              this.editExerciseData = undefined;
              this.mode = Mode.VIEW;
              this.snackbar.open('Exercise Edit Successful', 'Dismiss', {
                duration: 5000,
              });
            } else if (result == 0) {
              this.snackbar.open('Exercise name already exists', 'Got it', {
                duration: 5000,
              });
            }
          });
      }
    } else {
      this.editExerciseData = undefined;
      this.mode = Mode.VIEW;
    }
  }
}
