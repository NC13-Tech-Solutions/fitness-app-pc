import { Injectable } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { DayData } from 'src/app/shared/models/day-data.model';
import { ImportedExercise } from 'src/app/shared/models/imported-exercise.model';
import { VideoData } from 'src/app/shared/models/video-data.model';
import { Workout } from 'src/app/shared/models/workout.model';

@Injectable({
  providedIn: 'root',
})
export class DayFormService {
  public formGroup = new FormGroup({
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

  addEditData(value: DayData) {
    this.formGroup.setValue({
      userWeight: value.userWeight,
      workouts: [...value.workouts],
    });
  }

  // Workouts functions
  addNewWorkout() {
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
        }),
      );
    }
  }

  removeWorkout(indexNumber: number) {
    if (this.DayWorkouts != null) this.DayWorkouts.removeAt(indexNumber);
  }

  getWorkout(index: number):
    | FormGroup<{
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
    | undefined {
    if (this.DayWorkouts != null) {
      const w = this.DayWorkouts.controls.at(index);
      if (w) return w;
    }

    return undefined;
  }

  /**
   * Converts the Workout FormArray's {@link Partial} Workout[] value to Full {@link Workout}[] object
   * @returns The full workout array
   */
  getWorkouts(): Workout[] {
    let x: Workout[] = [];
    if(this.DayWorkouts)
    for (let i = 0; i < this.DayWorkouts.value.length; i++) {
      const dw_value = this.getCompleteWorkoutObject(
        this.DayWorkouts.at(i).value,
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
    }>,
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

  getImportedExercise(
    workOutIndex: number,
    ieIndex: number,
  ):
    | FormGroup<{
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
    | undefined {
    const workIEs = this.WorkoutExercises(workOutIndex);
    if (workIEs) {
      const ie = workIEs.controls.at(ieIndex);
      if (ie) return ie;
    }
    return undefined;
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
    }>[],
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
    }>,
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

  // Getters for formGroup
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
    > | null;
  }

  get UserWeight() {
    return this.formGroup.get('userWeight');
  }

  // Workouts Array

  WorkoutTime(index: number) {
    return this.getWorkout(index)?.get('time') as AbstractControl<
      string,
      string
    > | null;
  }

  WorkoutExercises(index: number) {
    return this.getWorkout(index)?.get('exercises') as FormArray<
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
    > | null;
  }

  WorkoutText(index: number) {
    return this.getWorkout(index)?.get('text') as AbstractControl<
      string,
      string
    > | null;
  }

  WorkoutPhotos(index: number) {
    return this.getWorkout(index)?.get('photos') as AbstractControl<
      string[],
      string[]
    > | null;
  }

  WorkoutVideos(index: number) {
    return this.getWorkout(index)?.get('videos') as AbstractControl<
      VideoData[],
      VideoData[]
    > | null;
  }

  // ImportedExercises Array

  WorkoutExerciseSlNo(workOutIndex: number, ieIndex: number) {
    return this.getImportedExercise(workOutIndex, ieIndex)?.get(
      'slNo',
    ) as AbstractControl<number, number> | null;
  }

  WorkoutExerciseExId(workOutIndex: number, ieIndex: number) {
    return this.getImportedExercise(workOutIndex, ieIndex)?.get(
      'exId',
    ) as AbstractControl<number, number> | null;
  }

  WorkoutExerciseWeightsUsed(workOutIndex: number, ieIndex: number) {
    return this.getImportedExercise(workOutIndex, ieIndex)?.get(
      'weightsUsed',
    ) as AbstractControl<number[], number[]> | null;
  }

  WorkoutExerciseDropSets(workOutIndex: number, ieIndex: number) {
    return this.getImportedExercise(workOutIndex, ieIndex)?.get(
      'dropSets',
    ) as AbstractControl<number, number> | null;
  }

  WorkoutExerciseRepRange(workOutIndex: number, ieIndex: number) {
    return this.getImportedExercise(workOutIndex, ieIndex)?.get(
      'repRange',
    ) as AbstractControl<string, string> | null;
  }

  WorkoutExerciseSets(workOutIndex: number, ieIndex: number) {
    return this.getImportedExercise(workOutIndex, ieIndex)?.get(
      'sets',
    ) as AbstractControl<number, number> | null;
  }

  WorkoutExerciseRestTime(workOutIndex: number, ieIndex: number) {
    return this.getImportedExercise(workOutIndex, ieIndex)?.get(
      'restTime',
    ) as AbstractControl<string, string> | null;
  }

  WorkoutExerciseSuperSetOf(workOutIndex: number, ieIndex: number) {
    return this.getImportedExercise(workOutIndex, ieIndex)?.get(
      'superSetOf',
    ) as AbstractControl<number, number> | null;
  }

  WorkoutExerciseExerciseExplainer(workOutIndex: number, ieIndex: number) {
    return this.getImportedExercise(workOutIndex, ieIndex)?.get(
      'exerciseExplainer',
    ) as AbstractControl<string, string> | null;
  }

  WorkoutExerciseExerciseFormVideos(workOutIndex: number, ieIndex: number) {
    return this.getImportedExercise(workOutIndex, ieIndex)?.get(
      'exerciseFormVideos',
    ) as AbstractControl<VideoData[], VideoData[]> | null;
  }
}
