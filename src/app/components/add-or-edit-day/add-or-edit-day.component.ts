import {
  Component,
  EventEmitter,
  OnInit,
  inject,
  input,
  output,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable, take } from 'rxjs';
import { DateDataService } from 'src/app/services/ctrl/date-data.service';
import { ExerciseService } from 'src/app/services/http/exercise.service';
import { DateData } from 'src/app/shared/models/date-data.model';
import { DayData } from 'src/app/shared/models/day-data.model';
import { Exercise } from 'src/app/shared/models/exercise.model';
import { FormStatus } from 'src/app/shared/models/form-status.model';
import { ImportedExercise } from 'src/app/shared/models/imported-exercise.model';
import { Mode } from 'src/app/shared/models/mode.model';
import { VideoData } from 'src/app/shared/models/video-data.model';
import { Workout } from 'src/app/shared/models/workout.model';

@Component({
  selector: 'app-add-or-edit-day',
  templateUrl: './add-or-edit-day.component.html',
  styleUrls: ['./add-or-edit-day.component.sass'],
})
export class AddOrEditDayComponent implements OnInit {
  mode = input<Mode>(Mode.ADD);
  dayData = input<DayData>();
  curDay = input.required<DateData>();
  callback = output<{ data: DayData; submit: boolean }>();

  private exerciseService = inject(ExerciseService);
  private snackbar = inject(MatSnackBar);
  private dateService = inject(DateDataService);

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
    // FIXME: On main form submit, edit not implemented
    console.log('Jimbarlakka', 'Form Submit');
    let userId_s = localStorage.getItem('UserId');
    let userId = 0;
    if (userId_s) {
      userId = parseInt(userId_s);
    }
    let date = this.dateService.getDateData();
    this.callback.emit({
      data: {
        ddId: this.dayData()?.ddId ?? 0,
        modifiedBy: userId,
        modifiedOn: date,
        postedBy: userId,
        postedOn: this.curDay(),
        userWeight: this.UserWeight?.value ?? 0,
        workouts: this.getWorkouts(),
      },
      submit: true,
    });
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
  }

  refreshExerciseData(): void {
    this.exerciseService
      .getAllExercises()
      .pipe(take(1))
      .subscribe((result) => this.exerciseDataSubject.next(result));
  }
  /**
   * Converts the Workout FormArray's {@link Partial} Workout[] value to Full {@link Workout}[] object
   * @returns The full workout array
   */
  getWorkouts(): Workout[] {
    let x: Workout[] = [];
    for (let i = 0; i < this.DayWorkouts.value.length; i++) {
      const dw_value = this.getCompleteWorkoutObject(
        this.DayWorkouts.at(i).value
      );
      if (dw_value) {
        x.push(dw_value);
      }
    }
    return x;
  }

  /**
   * Converts the {@link Partial} Workout object to Full {@link Workout} object
   * @returns The full Workout object
   */
  getCompleteWorkoutObject(
    x: Partial<{
      time: string;
      exercises: Partial<{
        slNo: number;
        exId: number;
        weightsUsed: number[];
        dropSets: number;
        repRange: string;
        sets: number;
        restTime: string;
        superSetOf: number;
        exerciseExplainer: string;
        exerciseFormVideos: VideoData[];
      }>[];
      text: string;
      photos: string[];
      videos: VideoData[];
    }>
  ): Workout | undefined {
    if (x == undefined) return undefined;
    const exercises = x.exercises;
    if (exercises == undefined) return undefined;
    const photos = x.photos;
    if (photos == undefined) return undefined;
    const text = x.text;
    if (text == undefined) return undefined;
    const time = x.time;
    if (time == undefined) return undefined;
    const videos = x.videos;
    if (videos == undefined) return undefined;

    return {
      exercises: this.getImportedExercises(exercises),
      photos,
      text,
      time,
      videos,
    };
  }

  /**
   * Converts the {@link Partial} ImportedExercise[] object to Full {@link ImportedExercise}[] object
   * @returns The full ImportedExercise array
   */
  getImportedExercises(
    x: Partial<{
      slNo: number;
      exId: number;
      weightsUsed: number[];
      dropSets: number;
      repRange: string;
      sets: number;
      restTime: string;
      superSetOf: number;
      exerciseExplainer: string;
      exerciseFormVideos: VideoData[];
    }>[]
  ): ImportedExercise[] {
    let result: ImportedExercise[] = [];

    for (let ie of x) {
      const rIE = this.getCompleteIEObject(ie);
      if (rIE) {
        result.push(rIE);
      }
    }
    return result;
  }

  /**
   * Converts the {@link Partial} ImportedExercise object to Full {@link ImportedExercise} object
   * @returns The full ImportedExercise object
   */
  getCompleteIEObject(
    x: Partial<{
      slNo: number;
      exId: number;
      weightsUsed: number[];
      dropSets: number;
      repRange: string;
      sets: number;
      restTime: string;
      superSetOf: number;
      exerciseExplainer: string;
      exerciseFormVideos: VideoData[];
    }>
  ): ImportedExercise | undefined {
    const slNo = x.slNo;
    if (slNo == undefined) return undefined;
    const exId = x.exId;
    if (exId == undefined) return undefined;
    const weightsUsed = x.weightsUsed;
    if (weightsUsed == undefined) return undefined;
    const dropSets = x.dropSets;
    if (dropSets == undefined) return undefined;
    const repRange = x.repRange;
    if (repRange == undefined) return undefined;
    const sets = x.sets;
    if (sets == undefined) return undefined;
    const restTime = x.restTime;
    if (restTime == undefined) return undefined;
    const superSetOf = x.superSetOf;
    if (superSetOf == undefined) return undefined;
    const exerciseExplainer = x.exerciseExplainer;
    if (exerciseExplainer == undefined) return undefined;
    const exerciseFormVideos = x.exerciseFormVideos;
    if (exerciseFormVideos == undefined) return undefined;

    return {
      dropSets,
      exerciseExplainer,
      exerciseFormVideos,
      exId,
      repRange,
      restTime,
      sets,
      slNo,
      superSetOf,
      weightsUsed,
    };
  }
}
