import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { DayService } from 'src/app/services/http/day.service';
import { DayData } from 'src/app/shared/models/day-data.model';
import { Mode } from 'src/app/shared/models/mode.model';
import { VideoData } from 'src/app/shared/models/video-data.model';

@Component({
  selector: 'app-add-or-edit-day',
  templateUrl: './add-or-edit-day.component.html',
  styleUrls: ['./add-or-edit-day.component.sass'],
})
export class AddOrEditDayComponent {
  @Input() mode!: Mode;
  @Input() dayData: DayData | undefined;
  @Output() callback = new EventEmitter<{ data: DayData; submit: boolean }>();

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

  removeWorkout(indexNumber: number) {
    if (this.DayWorkouts != null) this.DayWorkouts.removeAt(indexNumber);
  }

  onSubmit() {
    // FIXME: On main form submit
    console.log('Jimbarlakka', 'Form Submit');
  }

  resetForm() {
    // FIXME: On main form reset
    console.log('Jimbarlakka', 'Form Reset');
  }

  cancelForm() {
    // FIXME: On form cancelled
    console.log('Jimbarlakka', 'Form Cancelled');
  }
}
