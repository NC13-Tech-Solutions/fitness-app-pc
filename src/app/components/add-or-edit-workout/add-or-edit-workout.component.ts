import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';
import { FileSharingService } from 'src/app/services/http/file-sharing.service';
import { ExerciseSelected } from 'src/app/shared/models/exercise-selected.model';
import { Exercise } from 'src/app/shared/models/exercise.model';
import { FormStatus } from 'src/app/shared/models/form-status.model';
import { MiscDataType } from 'src/app/shared/models/misc-data-type.model';
import { Mode } from 'src/app/shared/models/mode.model';
import { VideoData } from 'src/app/shared/models/video-data.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-add-or-edit-workout',
  templateUrl: './add-or-edit-workout.component.html',
  styleUrls: ['./add-or-edit-workout.component.sass'],
})
export class AddOrEditWorkoutComponent implements AfterViewInit {
  @Input() mode: Mode = Mode.ADD;
  @Input() workoutIndex!: number;
  @Input() availableExercises!: Exercise[];
  @Input() formGroup!: FormGroup<{
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
  }>;
  @Output() addNewExercise = new EventEmitter<Exercise>();
  @Input() parentFormStatus = new EventEmitter<FormStatus>();
  @Output() formStatus = new EventEmitter<FormStatus>();

  private sanitizer = inject(DomSanitizer);
  private fileSharingService = inject(FileSharingService);
  store = inject(Store<{ exercisesSelected: ExerciseSelected[] }>);

  allowWorkoutImageUpload = false;
  allowWorkoutVideoUpload = false;
  dataType = MiscDataType;
  imageData: MiscDataType.IMAGE | MiscDataType.URL = MiscDataType.IMAGE;
  videoData: MiscDataType.VIDEO | MiscDataType.EMBEDDED = MiscDataType.VIDEO;
  uploadedFileInfo: {
    url: string;
    type: MiscDataType.IMAGE | MiscDataType.VIDEO;
  }[] = [];

  hydratedStoreData: ExerciseSelected[] = [];

  formStatusInfoForChild = new EventEmitter<FormStatus>();

  @ViewChild('image_file_mock_input') image_file_mock_input:
    | ElementRef<HTMLInputElement>
    | undefined;
  @ViewChild('video_file_mock_input') video_file_mock_input:
    | ElementRef<HTMLInputElement>
    | undefined;

  ngAfterViewInit(): void {
    this.store.select('exerciseSelections').subscribe((value) => {
      this.hydratedStoreData = value;
    });

    this.parentFormStatus.subscribe((value) => {
      if (value == FormStatus.CANCEL) {
        // FIXME: Call the form cancellor in this component
        console.log('Form Cancelled in Parent Component:', value);
      } else if (value == FormStatus.RESET) {
        // FIXME: Call the form resetter in this component
        console.log('Form Reset in Parent Component:', value);
      }
      this.formStatusInfoForChild.emit(value);
    });
  }

  // getters for formGroup

  get WorkoutTime() {
    return this.formGroup.get('time');
  }

  get WorkoutExercises() {
    return this.formGroup.get('exercises') as FormArray<
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
  }

  get WorkoutText() {
    return this.formGroup.get('text');
  }

  get WorkoutPhotos() {
    return this.formGroup.get('photos');
  }

  get WorkoutVideos() {
    return this.formGroup.get('videos');
  }

  addExercise(): void {
    if (this.WorkoutExercises != null) {
      this.WorkoutExercises.push(
        new FormGroup<{
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
        }>({
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
        })
      );
    }
  }

  removeExercise(indexNumber: number): void {
    if (this.WorkoutExercises != null) {
      this.WorkoutExercises.removeAt(indexNumber);
    }
  }

  addWorkoutImage(): void {
    // FIXME: Delete all the previous data from textarea and input file.
    this.allowWorkoutImageUpload = true;
  }

  addWorkoutVideo(): void {
    // FIXME: Delete all the previous data from textarea and input file.
    this.allowWorkoutVideoUpload = true;
  }

  image_file_mock_input_changeEvent(event: Event) {
    if (this.image_file_mock_input?.nativeElement.files?.length == 1) {
      let temp = this.image_file_mock_input.nativeElement.files.item(0);
      if (temp) this.uploadLocalFile(temp, MiscDataType.IMAGE);
    }
  }

  video_file_mock_input_changeEvent(event: Event) {
    if (this.video_file_mock_input?.nativeElement.files?.length == 1) {
      let temp = this.video_file_mock_input.nativeElement.files.item(0);
      if (temp) this.uploadLocalFile(temp, MiscDataType.VIDEO);
    }
  }

  openImageFileDialog() {
    if (this.image_file_mock_input) {
      this.image_file_mock_input.nativeElement.click();
    }
  }

  addImageUrl(url: string) {
    this.WorkoutPhotos?.value.push(url);
    this.allowWorkoutImageUpload = false;
  }

  openVideoFileDialog() {
    if (this.video_file_mock_input) {
      this.video_file_mock_input.nativeElement.click();
    }
  }

  uploadLocalFile(file: File, type: MiscDataType.IMAGE | MiscDataType.VIDEO) {
    if (type == MiscDataType.IMAGE) {
      this.fileSharingService
        .uploadFile(file, 'images')
        .pipe(take(1))
        .subscribe((value) => {
          if (value) {
            console.log('Jimbarlakka', value);
            let file_url = environment.api_url + 'files/images/view/' + value;
            this.uploadedFileInfo.push({
              url: file_url,
              type: MiscDataType.IMAGE,
            });
            this.WorkoutPhotos?.value.push(file_url);
            this.allowWorkoutImageUpload = false;
          }
        });
    } else if (type == MiscDataType.VIDEO) {
      this.fileSharingService
        .uploadFile(file, 'videos')
        .pipe(take(1))
        .subscribe((value) => {
          if (value) {
            console.log('Jimbarlakka', value);
            let file_url = environment.api_url + 'files/videos/view/' + value;
            this.uploadedFileInfo.push({
              url: file_url,
              type: MiscDataType.VIDEO,
            });
            this.WorkoutVideos?.value.push({
              data: file_url,
              type: MiscDataType.VIDEO,
            });
            this.allowWorkoutVideoUpload = false;
          }
        });
    }
  }

  addEmbeddedVideo(link: string) {
    if (this.WorkoutVideos) {
      this.WorkoutVideos.value.push({
        data: link,
        type: MiscDataType.EMBEDDED,
      });
      this.allowWorkoutVideoUpload = false;
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

  deleteLocalFile(
    fileUrl: string,
    index: number,
    type: MiscDataType.IMAGE | MiscDataType.VIDEO
  ) {
    // FIXME: Need to store items to be deleted, instead of deleting right away, while Editing
    if (type == MiscDataType.IMAGE) {
      const startUrl = environment.api_url + 'files/images/view/';
      const fileName = fileUrl.substring(startUrl.length);
      this.fileSharingService
        .deleteFile(fileName, 'images')
        .pipe(take(1))
        .subscribe((value) => {
          if (value == 1) {
            console.log('Jimbarlakka', value);
            this.WorkoutPhotos?.value.splice(index, 1);
          }
        });
    } else if (type == MiscDataType.VIDEO) {
      const startUrl = environment.api_url + 'files/videos/view/';
      const fileName = fileUrl.substring(startUrl.length);
      this.fileSharingService
        .deleteFile(fileName, 'videos')
        .pipe(take(1))
        .subscribe((value) => {
          if (value == 1) {
            console.log('Jimbarlakka', value);
            this.WorkoutVideos?.value.splice(index, 1);
          }
        });
    }
  }

  removeItem(index: number, type: MiscDataType.IMAGE | MiscDataType.VIDEO) {
    if (type == MiscDataType.IMAGE) {
      this.WorkoutPhotos?.value.splice(index, 1);
    } else if (type == MiscDataType.VIDEO) {
      this.WorkoutVideos?.value.splice(index, 1);
    }
  }

  checkIfLocalFile(url: string): boolean {
    return url.startsWith(environment.api_url);
  }

  resetForm() {
   // FIXME: Form Reset. So do any deletion here, if necessary
    this.formStatus.emit(FormStatus.RESET);
  }

  childFormStatus(index: number, status: FormStatus) {
    console.log(`Work Exercise Form #${index} reset status=${status}`);
  }
}
