import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Signal,
  ViewChild,
  WritableSignal,
  computed,
  inject,
  input,
  output,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { take } from 'rxjs';
import { FileSharingService } from 'src/app/services/http/file-sharing.service';
import { Exercise } from 'src/app/shared/models/exercise.model';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import { MiscDataType } from 'src/app/shared/models/misc-data-type.model';
import { environment } from 'src/environments/environment';
import { VideoData } from 'src/app/shared/models/video-data.model';
import { ExerciseSelected } from 'src/app/shared/models/exercise-selected.model';
import { MatDialog } from '@angular/material/dialog';
import { AddExerciseDialogComponent } from 'src/app/shared/dialogs/add-exercise-dialog/add-exercise-dialog.component';
import { FormStatus } from 'src/app/shared/models/form-status.model';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { SelectionsStore } from 'src/app/services/ctrl/selections.store';
import { DayFormService } from 'src/app/services/ctrl/day-form.service';

@Component({
  selector: 'app-workout-exercise-form',
  templateUrl: './workout-exercise-form.component.html',
  styleUrls: ['./workout-exercise-form.component.sass'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class WorkoutExerciseFormComponent implements OnInit {
  // FIXME: Need to get Add or Edit input data
  workoutIndex = input.required<number>();
  exerciseIndex = input.required<number>();
  availableExercises = input.required<Exercise[]>();
  addNewExercise = output<Exercise>();
  parentFormStatus = input.required<EventEmitter<FormStatus>>();
  formStatus = output<FormStatus>();

  private sanitizer = inject(DomSanitizer);
  private fileSharingService = inject(FileSharingService);
  store = inject(SelectionsStore);
  exercisesSelected = computed<ExerciseSelected[]>(() =>
    this.store.exerciseSelections(),
  );
  public addExerciseDialog = inject(MatDialog);
  dayFormService = inject(DayFormService);

  formGroup:
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
    | undefined;
  previousSelectedExId = 0;
  addWeightOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  allowVideoUpload = false;
  dataType = MiscDataType;
  uploadedFileUrl: string[] = [];
  videoData: MiscDataType.VIDEO | MiscDataType.EMBEDDED = MiscDataType.VIDEO;
  @ViewChild('video_file_mock_input') video_file_mock_input:
    | ElementRef<HTMLInputElement>
    | undefined;
  @ViewChild('exerciseNameAC') exerciseNameAC: MatAutocomplete | undefined;
  @ViewChild('superSetNameAC') superSetNameAC: MatAutocomplete | undefined;
  @ViewChild('workoutExInput') workoutExInput:
    | ElementRef<HTMLInputElement>
    | undefined;

  // Signals
  selectExerciseSignal: WritableSignal<string | number> = signal('');
  filteredExerciseArraySignal: Signal<Exercise[]> = computed<Exercise[]>(() =>
    this.getFilteredArray_E(
      this.availableExercises(),
      this.selectExerciseSignal(),
    ),
  );

  ngOnInit(): void {
    this.formGroup = this.dayFormService.getImportedExercise(
      this.workoutIndex(),
      this.exerciseIndex(),
    );

    if (this.WorkoutExerciseSlNo) {
      this.WorkoutExerciseSlNo.setValue(this.exerciseIndex());
    }

    if (this.WorkoutExerciseExId) {
      this.WorkoutExerciseExId.valueChanges.subscribe((value) => {
        if (value) {
          if (this.previousSelectedExId == 0) {
            // new Selection
            this.store.setExerciseSelection(
              this.exerciseIndex(),
              this.getExerciseNameFromExId(value),
            );
          } else {
            // Selection changed
            this.store.changeExerciseSelection(
              this.exerciseIndex(),
              this.getExerciseNameFromExId(value),
            );
          }
          this.previousSelectedExId = value;
        } else {
          if (this.previousSelectedExId != 0) {
            // Selection removed
            this.store.removeExerciseSelection(this.exerciseIndex());
            this.previousSelectedExId = 0;
          }
        }
      });
    }

    this.parentFormStatus().subscribe((value) => {
      if (value == FormStatus.CANCEL) {
        // FIXME: Call the form cancellor in this component
        console.log('Form Cancelled in Parent Component:', value);
        this.parentFormReset();
      } else if (value == FormStatus.RESET) {
        // FIXME: Call the form resetter in this component
        console.log('Form Reset in Parent Component:', value);
        this.parentFormCancelled();
      }
    });
  }

  // getters for formGroup

  get WorkoutExerciseSlNo() {
    return this.formGroup?.get('slNo');
  }

  get WorkoutExerciseExId() {
    return this.formGroup?.get('exId');
  }

  get WorkoutExerciseWeightsUsed() {
    return this.formGroup?.get('weightsUsed');
  }

  get WorkoutExerciseDropSets() {
    return this.formGroup?.get('dropSets');
  }

  get WorkoutExerciseRepRange() {
    return this.formGroup?.get('repRange');
  }

  get WorkoutExerciseSets() {
    return this.formGroup?.get('sets');
  }

  get WorkoutExerciseRestTime() {
    return this.formGroup?.get('restTime');
  }

  get WorkoutExerciseSuperSetOf() {
    return this.formGroup?.get('superSetOf');
  }

  get WorkoutExerciseExerciseExplainer() {
    return this.formGroup?.get('exerciseExplainer');
  }

  get WorkoutExerciseExerciseFormVideos() {
    return this.formGroup?.get('exerciseFormVideos');
  }

  getArrayWithoutCurrentIndex(): ExerciseSelected[] {
    return this.exercisesSelected().filter(
      (value) => value.exerciseSlNo != this.exerciseIndex(),
    );
  }

  getFilteredArray_ES(
    input: ExerciseSelected[],
    filter: string | number,
  ): ExerciseSelected[] {
    // If filter is an empty string
    if (filter === '') return input;
    // If filter is a number
    let numFilter = Number(filter);
    if (numFilter != undefined && !isNaN(numFilter)) {
      let x = this.checkIfExSlNoIsInArray(input, Number(filter));
      if (x.status) {
        return x.value ? [x.value] : input;
      }
      return input;
    }
    // If filter is a string and string is not empty
    else if (typeof filter === 'string') {
      return input.filter((value) =>
        value.exerciseName.toLowerCase().includes(filter.trim().toLowerCase()),
      );
    }
    // If filter is undefined
    return input;
  }

  getFilteredArray_E(input: Exercise[], filter: string | number): Exercise[] {
    // If filter is an empty string
    if (filter === '') return input;
    // If filter is a number
    let numFilter = Number(filter);
    if (numFilter != undefined && !isNaN(numFilter)) {
      let x = this.checkIfExIdIsInArray(input, numFilter);
      if (x.status) {
        return x.value ? [x.value] : input;
      }
      return input;
    }
    // If filter is a string and string is not empty
    else if (typeof filter === 'string') {
      return input.filter((value) =>
        value.name.toLowerCase().includes(filter.trim().toLowerCase()),
      );
    }
    // If filter is undefined
    return input;
  }

  getExerciseNameFromExId(exId: number): string {
    for (let ex of this.availableExercises()) {
      if (ex.exId == exId) {
        return ex.name;
      }
    }
    return '';
  }

  checkIfExSlNoIsInArray(
    input: ExerciseSelected[],
    exerciseSlNo: number,
  ): { status: boolean; value: ExerciseSelected | undefined } {
    console.log(`ExerciseSlNo check: ${exerciseSlNo}`);
    for (let ex of input) {
      if (ex.exerciseSlNo == exerciseSlNo) {
        return { status: true, value: ex };
      }
    }
    return { status: false, value: undefined };
  }

  checkIfExIdIsInArray(
    input: Exercise[],
    exId: number,
  ): { status: boolean; value: Exercise | undefined } {
    console.log(`Exid check: ${exId}`);
    for (let ex of input) {
      if (ex.exId == exId) {
        return { status: true, value: ex };
      }
    }
    return { status: false, value: undefined };
  }

  workoutExInputOnChange() {
    let notSet = true;
    if (this.workoutExInput) {
      const value = this.workoutExInput.nativeElement.value;
      console.log('====================================');
      console.log('workoutExerciseExId:', value);
      console.log('type:', typeof value);
      console.log('====================================');
      if (value != null) {
        if (value.trim() != '') {
          notSet = false;
          this.selectExerciseSignal.set(value.trim());
        }
      }
    }
    if (notSet) this.selectExerciseSignal.set('');
  }

  addWeight(event: MatChipInputEvent) {
    const value = (event.value || '').trim();

    if (value) {
      let x: number = parseFloat(value);
      if (this.WorkoutExerciseWeightsUsed && !isNaN(x)) {
        this.WorkoutExerciseWeightsUsed.value.push(x);
      }
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  removeWeight(index: number) {
    if (this.WorkoutExerciseWeightsUsed) {
      this.WorkoutExerciseWeightsUsed.value.splice(index, 1);
    }
  }

  editWeight(index: number, event: MatChipEditedEvent) {
    const value = event.value.trim();

    // Remove if weight is not provided
    if (!value) {
      this.removeWeight(index);
      return;
    }

    let x: number = parseFloat(value);
    if (this.WorkoutExerciseWeightsUsed && !isNaN(x)) {
      this.WorkoutExerciseWeightsUsed.value[index] = x;
    }
  }

  addVideo(): void {
    // FIXME: Delete all the previous data from textarea and input file.
    this.allowVideoUpload = true;
  }

  video_file_mock_input_changeEvent(event: Event) {
    if (this.video_file_mock_input?.nativeElement.files?.length == 1) {
      let temp = this.video_file_mock_input.nativeElement.files.item(0);
      if (temp) this.uploadLocalFile(temp);
    }
  }

  openVideoFileDialog() {
    if (this.video_file_mock_input) {
      this.video_file_mock_input.nativeElement.click();
    }
  }

  uploadLocalFile(file: File) {
    this.fileSharingService
      .uploadFile(file, 'videos')
      .pipe(take(1))
      .subscribe((value) => {
        if (value) {
          console.log('Jimbarlakka', value);
          let file_url = environment.api_url + 'files/videos/view/' + value;
          this.uploadedFileUrl.push(file_url);
          this.WorkoutExerciseExerciseFormVideos?.value.push({
            data: file_url,
            type: MiscDataType.VIDEO,
          });
          this.allowVideoUpload = false;
        }
      });
  }

  addEmbeddedVideo(link: string) {
    if (this.WorkoutExerciseExerciseFormVideos) {
      this.WorkoutExerciseExerciseFormVideos.value.push({
        data: link,
        type: MiscDataType.EMBEDDED,
      });
      this.allowVideoUpload = false;
    }
  }

  getSanitizedUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  getSanitizedHtml(embeddedLink: string) {
    let sanitizedSafeHtml: SafeHtml;
    sanitizedSafeHtml = this.sanitizer.bypassSecurityTrustHtml(embeddedLink);
    return sanitizedSafeHtml;
  }

  deleteLocalFile(fileUrl: string, index: number) {
    // FIXME: Need to store items to be deleted, instead of deleting right away, while Editing

    const startUrl = environment.api_url + 'files/videos/view/';
    const fileName = fileUrl.substring(startUrl.length);
    this.fileSharingService
      .deleteFile(fileName, 'videos')
      .pipe(take(1))
      .subscribe((value) => {
        if (value == 1) {
          console.log('Jimbarlakka', value);
          this.WorkoutExerciseExerciseFormVideos?.value.splice(index, 1);
        }
      });
  }

  removeItem(index: number) {
    this.WorkoutExerciseExerciseFormVideos?.value.splice(index, 1);
  }

  resetForm() {
    // FIXME: On Form Reset
    if (this.exerciseNameAC) {
      this.exerciseNameAC.options.forEach((item) => item.deselect());
    }
    if (this.superSetNameAC) {
      this.superSetNameAC.options.forEach((item) => item.deselect());
    }
    this.formGroup?.reset(
      {
        slNo: 0,
        dropSets: 0,
        exerciseExplainer: '',
        exerciseFormVideos: [],
        exId: 0,
        repRange: '',
        restTime: '',
        sets: 0,
        superSetOf: 0,
        weightsUsed: [],
      },
      { onlySelf: false, emitEvent: true },
    );
    console.log('Jimbarlakka', 'Workout Exercise Form Reset');
  }

  parentFormReset() {
    // FIXME: Form Reset. So do any deletion here, if necessary
    this.resetForm();
    this.formStatus.emit(FormStatus.RESET);
  }

  parentFormCancelled() {
    // FIXME: Form Cancelled. So do any deletion here, if necessary
    this.formStatus.emit(FormStatus.CANCEL);
  }

  addExercise() {
    const dialogRef = this.addExerciseDialog.open(AddExerciseDialogComponent, {
      data: this.availableExercises,
    });
    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((result: { data: Exercise; submit: boolean }) => {
        if (result.submit) {
          this.addNewExercise.emit(result.data);
        }
      });
  }
}
