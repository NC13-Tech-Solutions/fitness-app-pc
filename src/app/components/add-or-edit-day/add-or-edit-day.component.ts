import {
  Component,
  EventEmitter,
  OnInit,
  Signal,
  WritableSignal,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs';
import { DateDataService } from 'src/app/services/ctrl/date-data.service';
import { DayFormService } from 'src/app/services/ctrl/day-form.service';
import { ExerciseService } from 'src/app/services/http/exercise.service';
import { DateData } from 'src/app/shared/models/date-data.model';
import { DayData } from 'src/app/shared/models/day-data.model';
import { Exercise } from 'src/app/shared/models/exercise.model';
import { FormStatus } from 'src/app/shared/models/form-status.model';
import { Mode } from 'src/app/shared/models/mode.model';

@Component({
    selector: 'app-add-or-edit-day',
    templateUrl: './add-or-edit-day.component.html',
    styleUrls: ['./add-or-edit-day.component.sass'],
    standalone: false
})
export class AddOrEditDayComponent implements OnInit {
  mode = input<Mode>(Mode.ADD);
  dayData = input<DayData>();
  curDay = input.required<DateData>();
  callback = output<{ data: DayData | undefined; submit: boolean }>();

  private exerciseService = inject(ExerciseService);
  private snackbar = inject(MatSnackBar);
  private dateService = inject(DateDataService);

  dayOperationMode = Mode;
  submitButtonText: 'Submit' | 'Edit' = 'Submit';

  dayFormService = inject(DayFormService);
  formGroup = this.dayFormService.formGroup;

  allExercises: WritableSignal<Exercise[] | undefined> = signal(undefined);
  availableExercises: Signal<Exercise[]> = computed(() => {
    const exercises = this.allExercises();
    if (exercises) return exercises.filter((value) => !value.disabled);
    return [];
  });

  formStatusInfoForChild = new EventEmitter<FormStatus>();

  ngOnInit(): void {
    this.refreshExerciseData();
    const dd = this.dayData();
    if (dd && this.mode() == Mode.EDIT) {
      this.dayFormService.addEditData(dd);
    }
  }

  // getters for formGroup

  get UserWeight() {
    return this.dayFormService.UserWeight;
  }

  get DayWorkouts(){
    return this.dayFormService.DayWorkouts;
  }


  addWorkout() {
    this.dayFormService.addNewWorkout();
  }

  addNewExercise(newExercise: Exercise) {
    this.exerciseService
      .addExercise(newExercise)
      .pipe(take(1))
      .subscribe((result) => {
        if (result == 1) {
          // this.availableExercises.push(newExercise);
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
  }

  removeWorkout(indexNumber: number) {
    this.dayFormService.removeWorkout(indexNumber);
  }

  onSubmit() {
    // FIXME: On main form submit, other actions are not implemented
    console.log('Jimbarlakka', 'Form Submit');
    const dd = this.dayData();
    let userId_s = localStorage.getItem('UserId');
    let userId = 0;
    if (userId_s) {
      userId = parseInt(userId_s);
    }
    let date = this.dateService.getDateData();
    if (this.mode() == Mode.ADD) {
      // Add day
      this.callback.emit({
        data: {
          ddId: dd?.ddId ?? 0,
          modifiedBy: userId,
          modifiedOn: date,
          postedBy: userId,
          postedOn: this.curDay(),
          userWeight: this.UserWeight?.value ?? 0,
          workouts: this.dayFormService.getWorkouts(),
        },
        submit: true,
      });
    } else if (this.mode() == Mode.EDIT) {
      // Edit day
      this.callback.emit({
        data: {
          ddId: dd?.ddId ?? 0,
          modifiedBy: userId,
          modifiedOn: date,
          postedBy: dd?.postedBy ?? userId,
          postedOn: dd?.postedOn ?? this.curDay(),
          userWeight: this.UserWeight?.value ?? 0,
          workouts: this.dayFormService.getWorkouts(),
        },
        submit: true,
      });
    }
  }

  resetForm() {
    // FIXME: On main form reset, edit not implemented
    console.log('Jimbarlakka', 'Form Reset');
    this.formStatusInfoForChild.emit(FormStatus.RESET);
  }

  cancelForm() {
    // FIXME: On form cancelled, edit not implemented
    console.log('Jimbarlakka', 'Form Cancelled');
    this.formStatusInfoForChild.emit(FormStatus.CANCEL);
  }

  childFormStatus(index: number, status: FormStatus) {
    console.log(`Workout Form #${index} reset status=${status}`);
    //FIXME: Form Reset and Form Cancel is not working properly
    if (status == FormStatus.RESET) {
      // Child form reset
      if (this.mode() == Mode.EDIT) {
        // Clearing DayWorkouts array
        const dd = this.dayData();
        if (dd) {
          this.dayFormService.addEditData(dd);
        }
      }
    } else if (status == FormStatus.CANCEL) {
      // Child form cancelled
      this.callback.emit({ submit: false, data: undefined });
    }
  }

  refreshExerciseData(): void {
    this.exerciseService
      .getAllExercises()
      .pipe(take(1))
      .subscribe((result) => this.allExercises.set(result));
  }

}
