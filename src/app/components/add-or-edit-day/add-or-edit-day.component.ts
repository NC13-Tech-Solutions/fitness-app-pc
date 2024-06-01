import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable, take } from 'rxjs';
import { ExerciseService } from 'src/app/services/http/exercise.service';
import { DayData } from 'src/app/shared/models/day-data.model';
import { Exercise } from 'src/app/shared/models/exercise.model';
import { FormStatus } from 'src/app/shared/models/form-status.model';
import { Mode } from 'src/app/shared/models/mode.model';
import { VideoData } from 'src/app/shared/models/video-data.model';

@Component({
  selector: 'app-add-or-edit-day',
  templateUrl: './add-or-edit-day.component.html',
  styleUrls: ['./add-or-edit-day.component.sass'],
})
export class AddOrEditDayComponent implements OnInit{
  @Input() mode: Mode = Mode.ADD;
  @Input() dayData: DayData | undefined;
  @Output() callback = new EventEmitter<{ data: DayData; submit: boolean }>();

  private exerciseService = inject(ExerciseService);
  private snackbar = inject(MatSnackBar);

  private exerciseDataSubject = new BehaviorSubject<Exercise[]>([]);

  dayOperationMode = Mode;
  submitButtonText: 'Add' | 'Edit' = 'Add';

  formGroup = new FormGroup({
    userWeight: new FormControl(50, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    workouts: new FormArray([
      new FormGroup({
        time: new FormControl('12:00 AM', {
          nonNullable: true,
          validators: [
            Validators.required,
            Validators.pattern('^(0?[1-9]|1[0-2]):[0-5][0-9] ([AP][M])$'), // Regex for hh:mm a as in 12:00 PM is accepted
          ],
        }),
        exercises: new FormArray([
          new FormGroup({
            slNo: new FormControl(0, {
              nonNullable: true,
              validators: [Validators.required],
            }),
            exId: new FormControl(0, {
              nonNullable: true,
              validators: [Validators.required],
            }),
            weightsUsed: new FormControl<number[]>([], {
              nonNullable: true,
            }),
            dropSets: new FormControl(0, {
              nonNullable: true,
            }),
            repRange: new FormControl('', {
              nonNullable: true,
              validators: [Validators.required],
            }),
            sets: new FormControl(0, {
              nonNullable: true,
              validators: [Validators.required],
            }),
            restTime: new FormControl('', {
              nonNullable: true,
              validators: [Validators.required],
            }),
            superSetOf: new FormControl(-1, {
              nonNullable: true,
            }),
            exerciseExplainer: new FormControl('', {
              nonNullable: true,
            }),
            exerciseFormVideos: new FormControl<VideoData[]>([], {
              nonNullable: true,
            }),
          }),
        ]),
        text: new FormControl('', {
          nonNullable: true,
        }),
        photos: new FormControl<string[]>([], {
          nonNullable: true,
        }),
        videos: new FormControl<VideoData[]>([], {
          nonNullable: true,
        }),
      }),
    ]),
  });

  allExercises: Observable<Exercise[]> | undefined;
  availableExercises: Exercise[] = [];

  formStatusInfoForChild = new EventEmitter<FormStatus>();

  ngOnInit(): void {
    this.refreshExerciseData();
    this.allExercises = this.exerciseDataSubject.asObservable();

    this.allExercises.subscribe((value) => {
      this.availableExercises = [];
      value.forEach((ex) => {
        if (!ex.disabled) this.availableExercises.push(ex);
      });
    });
  }

  // getters for formGroup

  get UserWeight() {
    return this.formGroup.get('userWeight');
  }

  get DayWorkouts() {
    return this.formGroup.get('workouts') as FormArray<
      FormGroup<{
        time: FormControl<string>;
        exercises: FormArray<
          FormGroup<{
            slNo: FormControl<number>;
            exId: FormControl<number>;
            weightsUsed: FormControl<number[]>;
            dropSets: FormControl<number>;
            repRange: FormControl<string>;
            sets: FormControl<number>;
            restTime: FormControl<string>;
            superSetOf: FormControl<number>;
            exerciseExplainer: FormControl<string>;
            exerciseFormVideos: FormControl<VideoData[]>;
          }>
        >;
        text: FormControl<string>;
        photos: FormControl<string[]>;
        videos: FormControl<VideoData[]>;
      }>
    >;
  }

  addWorkout() {
    if (this.DayWorkouts != null) {
      this.DayWorkouts.push(
        new FormGroup<{
          time: FormControl<string>;
          exercises: FormArray<
            FormGroup<{
              slNo: FormControl<number>;
              exId: FormControl<number>;
              weightsUsed: FormControl<number[]>;
              dropSets: FormControl<number>;
              repRange: FormControl<string>;
              sets: FormControl<number>;
              restTime: FormControl<string>;
              superSetOf: FormControl<number>;
              exerciseExplainer: FormControl<string>;
              exerciseFormVideos: FormControl<VideoData[]>;
            }>
          >;
          text: FormControl<string>;
          photos: FormControl<string[]>;
          videos: FormControl<VideoData[]>;
        }>({
          time: new FormControl('12:00 AM', {
            nonNullable: true,
            validators: [
              Validators.required,
              Validators.pattern('^(0?[1-9]|1[0-2]):[0-5][0-9] ([AP][M])$'), // Regex for hh:mm a as in 12:00 PM is accepted
            ],
          }),
          exercises: new FormArray([
            new FormGroup({
              slNo: new FormControl(0, {
                nonNullable: true,
                validators: [Validators.required],
              }),
              exId: new FormControl(0, {
                nonNullable: true,
                validators: [Validators.required],
              }),
              weightsUsed: new FormControl<number[]>([], {
                nonNullable: true,
              }),
              dropSets: new FormControl(0, {
                nonNullable: true,
              }),
              repRange: new FormControl('', {
                nonNullable: true,
                validators: [Validators.required],
              }),
              sets: new FormControl(0, {
                nonNullable: true,
                validators: [Validators.required],
              }),
              restTime: new FormControl('', {
                nonNullable: true,
                validators: [Validators.required],
              }),
              superSetOf: new FormControl(-1, {
                nonNullable: true,
              }),
              exerciseExplainer: new FormControl('', {
                nonNullable: true,
              }),
              exerciseFormVideos: new FormControl<VideoData[]>([], {
                nonNullable: true,
              }),
            }),
          ]),
          text: new FormControl('', {
            nonNullable: true,
          }),
          photos: new FormControl<string[]>([], {
            nonNullable: true,
          }),
          videos: new FormControl<VideoData[]>([], {
            nonNullable: true,
          }),
        })
      );
    }
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
    if (this.DayWorkouts != null) this.DayWorkouts.removeAt(indexNumber);
  }

  onSubmit() {
    // FIXME: On main form submit
    // FIXME: User data is not retrieved here
    console.log('Jimbarlakka', 'Form Submit');
    this.callback.emit({data:{
      ddId: this.dayData?.ddId ?? 0,
      modifiedBy:
    },submit: true})
  }

  resetForm() {
    // FIXME: On main form reset
    console.log('Jimbarlakka', 'Form Reset');
    this.formStatusInfoForChild.emit(FormStatus.RESET);
  }

  cancelForm() {
    // FIXME: On form cancelled
    console.log('Jimbarlakka', 'Form Cancelled');
    this.formStatusInfoForChild.emit(FormStatus.CANCEL);
  }

  childFormStatus(index: number, status: FormStatus) {
    console.log(`Workout Form #${index} reset status=${status}`);
  }

  refreshExerciseData(): void {
    this.exerciseService
      .getAllExercises()
      .pipe(take(1))
      .subscribe((result) => this.exerciseDataSubject.next(result));
  }
}
