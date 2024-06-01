import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { BehaviorSubject, Observable, take } from 'rxjs';
import { ExerciseService } from '../../services/http/exercise.service';
import { Exercise } from '../../shared/models/exercise.model';
import { Mode } from '../../shared/models/mode.model';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.sass'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ExercisesComponent implements OnInit {
  private router = inject(Router);
  private snackbar = inject(MatSnackBar);

  private exerciseService = inject(ExerciseService);

  private exerciseDataSubject = new BehaviorSubject<Exercise[]>([]);
  public exercises: Observable<Exercise[]> | undefined;

  public mode: Mode = Mode.VIEW;
  exerciseMode = Mode;
  editExerciseData: Exercise | undefined;

  ngOnInit(): void {
    this.refreshExerciseData();
    this.exercises = this.exerciseDataSubject.asObservable();
  }

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
      } else if (this.mode == Mode.EDIT) {
        this.exerciseService
          .editExercise(value.data)
          .pipe(take(1))
          .subscribe((result) => {
            if (result == 1) {
              this.editExerciseData = undefined;
              this.mode = Mode.VIEW;
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
      this.editExerciseData = undefined;
      this.mode = Mode.VIEW;
    }
  }

  refreshExerciseData(): void {
    this.exerciseService
      .getAllExercises()
      .pipe(take(1))
      .subscribe((result) => this.exerciseDataSubject.next(result));
  }
}
