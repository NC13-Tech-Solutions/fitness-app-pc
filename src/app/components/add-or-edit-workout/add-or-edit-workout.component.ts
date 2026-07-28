import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  ViewChild,
  inject,
  input,
  output,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { take } from 'rxjs';
import { DayFormService } from 'src/app/services/ctrl/day-form.service';
import { FileSharingService } from 'src/app/services/http/file-sharing.service';
import { TimePickerDialogComponent } from 'src/app/shared/dialogs/time-picker-dialog/time-picker-dialog.component';
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
    standalone: false
})
export class AddOrEditWorkoutComponent implements OnInit {
  mode = input<Mode>(Mode.ADD);
  workoutIndex = input.required<number>();
  availableExercises = input.required<Exercise[]>();
  addNewExercise = output<Exercise>();
  parentFormStatus = input.required<EventEmitter<FormStatus>>();
  formStatus = output<FormStatus>();

  private sanitizer = inject(DomSanitizer);
  private fileSharingService = inject(FileSharingService);
  private changeDetection = inject(ChangeDetectorRef);
  private timePicker = inject(MatDialog);

  dayFormService = inject(DayFormService);

  formGroup:
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
    | undefined;
  allowWorkoutImageUpload = false;
  allowWorkoutVideoUpload = false;
  dataType = MiscDataType;
  imageData: MiscDataType.IMAGE | MiscDataType.URL = MiscDataType.IMAGE;
  videoData: MiscDataType.VIDEO | MiscDataType.EMBEDDED = MiscDataType.VIDEO;
  uploadedFileInfo: Record<
    string,
    {
      fileName: string;
      type: MiscDataType.IMAGE | MiscDataType.VIDEO;
      data: string;
      processing: boolean;
    }
  > = {};

  formStatusInfoForChild = new EventEmitter<FormStatus>();

  @ViewChild('image_file_mock_input') image_file_mock_input:
    | ElementRef<HTMLInputElement>
    | undefined;
  @ViewChild('video_file_mock_input') video_file_mock_input:
    | ElementRef<HTMLInputElement>
    | undefined;

  ngOnInit(): void {
    this.formGroup = this.dayFormService.getWorkout(this.workoutIndex());
    this.parentFormStatus().subscribe((value) => {
      if (value == FormStatus.CANCEL) {
        // FIXME: Call the form cancellor in this component
        console.log('Form Cancelled in Parent Component:', value);
      } else if (value == FormStatus.RESET) {
        // FIXME: Call the form resetter in this component
        console.log('Form Reset in Parent Component:', value);
        this.resetForm();
      }
      this.formStatusInfoForChild.emit(value);
    });
  }

  // getters for formGroup

  get WorkoutTime() {
    return this.dayFormService.WorkoutTime(this.workoutIndex());
  }

  get WorkoutExercises() {
    return this.dayFormService.WorkoutExercises(this.workoutIndex());
  }

  get WorkoutText() {
    return this.dayFormService.WorkoutText(this.workoutIndex());
  }

  get WorkoutPhotos() {
    return this.dayFormService.WorkoutPhotos(this.workoutIndex());
  }

  get WorkoutVideos() {
    return this.dayFormService.WorkoutVideos(this.workoutIndex());
  }

  openTimerPicker() {
    let time = '';
    if (this.WorkoutTime && !this.WorkoutTime.hasError('required')) {
      if (this.WorkoutTime.valid) {
        time = this.WorkoutTime.value;
      }
    }
    const dialogRef = this.timePicker.open(TimePickerDialogComponent, {
      data: time,
    });
    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((result: { data: string; submit: boolean }) => {
        if (result.submit) {
          this.WorkoutTime?.setValue(result.data);
        }
      });
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
        }),
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
            this.uploadedFileInfo[file_url] = {
              fileName: value,
              type: MiscDataType.IMAGE,
              data: '',
              processing: false,
            };
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
            this.uploadedFileInfo[file_url] = {
              fileName: value,
              type: MiscDataType.VIDEO,
              data: '',
              processing: false,
            };
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
    if (this.checkIfLocalFile(url)) {
      console.log(`Image url: ${url}`);

      // Checking to see if we have the entry in the record
      if (this.uploadedFileInfo[url]) {
        // Checking to see if we have the blob url
        if (this.uploadedFileInfo[url].data === '') {
          this.viewLocalFile(url);
          return '';
        }
        return this.sanitizer.bypassSecurityTrustUrl(
          this.uploadedFileInfo[url].data,
        );
      }
      return '';
    }
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
    type: MiscDataType.IMAGE | MiscDataType.VIDEO,
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
            this.deleteRecord(fileUrl);
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
            this.deleteRecord(fileUrl);
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

  deleteRecord(key: string) {
    const temp = { ...this.uploadedFileInfo };

    delete temp[key];

    this.uploadedFileInfo = temp;
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

  viewLocalFile(fileUrl: string) {
    if (
      this.uploadedFileInfo[fileUrl] &&
      this.uploadedFileInfo[fileUrl].data === '' &&
      !this.uploadedFileInfo[fileUrl].processing
    ) {
      this.uploadedFileInfo[fileUrl].processing = true;
      if (this.uploadedFileInfo[fileUrl].type == MiscDataType.IMAGE) {
        this.fileSharingService
          .viewImageFile(fileUrl)
          .pipe(take(1))
          .subscribe({
            next: (result) =>
              result.pipe(take(1)).subscribe((imgSrc) => {
                this.uploadedFileInfo[fileUrl].processing = false;
                this.uploadedFileInfo[fileUrl].data = imgSrc;
                console.log(`loaded image ${imgSrc}`);
                this.changeDetection.detectChanges();
              }),
            error: (err) => console.log(err),
          });
      } else if (this.uploadedFileInfo[fileUrl].type == MiscDataType.VIDEO) {
        this.fileSharingService
          .viewVideoFile(fileUrl)
          .pipe(take(1))
          .subscribe((vidSrc) => {
            this.uploadedFileInfo[fileUrl].processing = false;
            this.uploadedFileInfo[fileUrl].data = vidSrc;
            console.log(`loaded image ${vidSrc}`);
            this.changeDetection.detectChanges();
          });
      }
    }
  }
}
