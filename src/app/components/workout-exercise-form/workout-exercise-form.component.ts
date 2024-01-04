import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable, filter, take } from 'rxjs';
import { ExerciseService } from 'src/app/services/http/exercise.service';
import { FileSharingService } from 'src/app/services/http/file-sharing.service';
import { Exercise } from 'src/app/shared/models/exercise.model';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import { MiscDataType } from 'src/app/shared/models/misc-data-type.model';
import { environment } from 'src/environments/environment';
import { VideoData } from 'src/app/shared/models/video-data.model';
import { Store } from '@ngrx/store';
import { ExerciseSelected } from 'src/app/shared/models/exercise-selected.model';
import {
  changeExerciseSelection,
  removeExerciseSelection,
  setExerciseSelection,
} from 'src/app/services/ctrl/exercise-selections.actions';

@Component({
  selector: 'app-workout-exercise-form',
  templateUrl: './workout-exercise-form.component.html',
  styleUrls: ['./workout-exercise-form.component.sass'],
})
export class WorkoutExerciseFormComponent implements OnInit, AfterViewInit {
  // FIXME: Need to get Add or Edit input data
  @Input() formGroup!: FormGroup<{
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
  }>;
  @Input() exerciseIndex!: number;
  @Input() exercisesSelected!: ExerciseSelected[];

  private sanitizer = inject(DomSanitizer);
  private exerciseService = inject(ExerciseService);
  private fileSharingService = inject(FileSharingService);
  store = inject(Store<{ exercisesSelected: ExerciseSelected[] }>);
  availableExercises: Exercise[] = [];

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

  ngOnInit(): void {
    this.exerciseService
      .getAllExercises()
      .pipe(take(1))
      .subscribe((value) => {
        value.forEach((ex) => {
          if (!ex.disabled) this.availableExercises.push(ex);
        });
      });
  }

  ngAfterViewInit(): void {
    if (this.WorkoutExerciseSlNo) {
      this.WorkoutExerciseSlNo.setValue(this.exerciseIndex);
    }

    if (this.WorkoutExerciseExId) {
      this.WorkoutExerciseExId.valueChanges.subscribe((value) => {
        if (value) {
          if (this.previousSelectedExId == 0) {
            // new Selection
            this.store.dispatch(
              setExerciseSelection({
                exerciseSlNo: this.exerciseIndex,
                exerciseName: this.getExerciseNameFromExId(value),
              })
            );
          } else {
            // Selection changed
            this.store.dispatch(
              changeExerciseSelection({
                exerciseSlNo: this.exerciseIndex,
                exerciseName: this.getExerciseNameFromExId(value),
              })
            );
          }
          this.previousSelectedExId = value;
        } else {
          if (this.previousSelectedExId != 0) {
            // Selection removed
            this.store.dispatch(
              removeExerciseSelection({ exerciseSlNo: this.exerciseIndex })
            );
            this.previousSelectedExId = 0;
          }
        }
      });
    }
  }

  // getters for formGroup

  get WorkoutExerciseSlNo() {
    return this.formGroup.get('slNo');
  }

  get WorkoutExerciseExId() {
    return this.formGroup.get('exId');
  }

  get WorkoutExerciseWeightsUsed() {
    return this.formGroup.get('weightsUsed');
  }

  get WorkoutExerciseDropSets() {
    return this.formGroup.get('dropSets');
  }

  get WorkoutExerciseRepRange() {
    return this.formGroup.get('repRange');
  }

  get WorkoutExerciseSets() {
    return this.formGroup.get('sets');
  }

  get WorkoutExerciseRestTime() {
    return this.formGroup.get('restTime');
  }

  get WorkoutExerciseSuperSetOf() {
    return this.formGroup.get('superSetOf');
  }

  get WorkoutExerciseExerciseExplainer() {
    return this.formGroup.get('exerciseExplainer');
  }

  get WorkoutExerciseExerciseFormVideos() {
    return this.formGroup.get('exerciseFormVideos');
  }

  getFilteredArray(): ExerciseSelected[]{
    return this.exercisesSelected.filter(
      (value) => value.exerciseSlNo != this.exerciseIndex
    );
  }

  getExerciseNameFromExId(exId: number): string {
    for (let ex of this.availableExercises) {
      if (ex.exId == exId) {
        return ex.name;
      }
    }
    return '';
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
  }
}
