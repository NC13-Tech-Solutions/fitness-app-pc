import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import { take } from 'rxjs';
import { ExerciseService } from 'app/services/http/exercise.service';
import { Exercise } from 'app/shared/models/exercise.model';
import { Mode } from 'app/shared/models/mode.model';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SelectionsStore } from 'app/services/ctrl/selections.store';
import { FormStatus } from 'app/shared/models/form-status.model';

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.sass'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ExercisesComponent implements OnInit {
  private router = inject(Router);
  private snackbar = inject(MatSnackBar);
  private store = inject(SelectionsStore);

  private exerciseService = inject(ExerciseService);

  public exercises: WritableSignal<Exercise[]> = signal([]);

  public mode: WritableSignal<Mode> = signal(Mode.VIEW);
  exerciseMode = Mode;
  editExerciseData: WritableSignal<Exercise | undefined> = signal(undefined);

  ngOnInit(): void {
    this.refreshExerciseData();
  }

  close_nav() {
    if (this.mode() == Mode.VIEW) {
      this.router.navigateByUrl('/main');
    } else {
      this.store.changeMainFormStatus(FormStatus.CANCEL);
    }
  }

  addExercise() {
    this.editExerciseData.set(undefined);
    this.mode.set(Mode.ADD);
  }

  editExercise(value: Exercise) {
    this.editExerciseData.set(value);
    this.mode.set(Mode.EDIT);
  }

  addOrEditExercise(value: { data: Exercise; submit: boolean }) {
    if (value.submit) {
      if (this.mode() == Mode.ADD) {
        this.exerciseService
          .addExercise(value.data)
          .pipe(take(1))
          .subscribe((result) => {
            if (result == 1) {
              this.editExerciseData.set(undefined);
              this.mode.set(Mode.VIEW);
              this.refreshExerciseData();
              this.snackbar.open('Exercise Added', 'Dismiss', {
                duration: 5000,
              });
            } else if (result == 0) {
              this.snackbar.open('Exercise already exists', 'Got it', {
                duration: 5000,
              });
            }
          });
      } else if (this.mode() == Mode.EDIT) {
        this.exerciseService
          .editExercise(value.data)
          .pipe(take(1))
          .subscribe((result) => {
            if (result == 1) {
              this.editExerciseData.set(undefined);
              this.mode.set(Mode.VIEW);
              this.refreshExerciseData();
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
      this.editExerciseData.set(undefined);
      this.mode.set(Mode.VIEW);
    }
  }

  refreshExerciseData(): void {
    this.exerciseService
      .getAllExercises()
      .pipe(take(1))
      .subscribe((result) => this.exercises.set(result));
  }
}
