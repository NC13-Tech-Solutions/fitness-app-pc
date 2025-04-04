import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  WritableSignal,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { Mode } from '../../shared/models/mode.model';
import { Exercise } from '../../shared/models/exercise.model';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MiscDataType } from '../../shared/models/misc-data-type.model';
import { Observable, of, take } from 'rxjs';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';
import { FileSharingService } from '../../services/http/file-sharing.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-add-or-edit-exercise',
  templateUrl: './add-or-edit-exercise.component.html',
  styleUrls: ['./add-or-edit-exercise.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddOrEditExerciseComponent implements AfterViewInit, OnInit {
  mode = input<Mode>(Mode.ADD);
  exercise = input<Exercise>();
  allExercisesData = input.required<Exercise[]>();
  callback = output<{ data: Exercise; submit: boolean }>();
  private sanitizer = inject(DomSanitizer);
  private fileSharingService = inject(FileSharingService);
  private changeDetection = inject(ChangeDetectorRef);

  toggleText: WritableSignal<'Enabled' | 'Disabled'> = signal('Enabled');
  togglePreview: WritableSignal<'See' | 'Close'> = signal('See');
  submitButtonText: WritableSignal<'Add' | 'Edit'> = signal('Add');
  acceptText: WritableSignal<'image/*' | 'video/mp4'> = signal('image/*');
  extraDataText: WritableSignal<
    'No Extra Data' | 'Image link' | 'Video link' | 'Embedded Video link'
  > = signal('No Extra Data');
  localDataText: WritableSignal<'Image' | 'Video'> = signal('Image');
  fileStatus: WritableSignal<'Upload' | 'Delete'> = signal('Upload');
  exerciseMode = Mode;
  extraDataType = MiscDataType;
  enablePreview: WritableSignal<boolean> = signal(false);
  @ViewChild('file_mock_input') file_mock_input:
    | ElementRef<HTMLInputElement>
    | undefined;
  previewData: WritableSignal<string | undefined> = signal(undefined);
  sanitizedSafeHtml: WritableSignal<SafeHtml> = signal('');
  sanitizedSrc: WritableSignal<SafeUrl> = signal('');
  openedFile: WritableSignal<File | undefined> = signal(undefined);
  uploadedFileName:WritableSignal<string|undefined> = signal(undefined);

  formGroup = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
      asyncValidators: [this.exerciseNameValidator.bind(this)],
    }),
    description: new FormControl('', {
      nonNullable: true,
    }),
    miscDataType: new FormControl<MiscDataType>(MiscDataType.NONE, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    miscData: new FormControl(
      { value: '', disabled: true },
      { nonNullable: true }
    ),
    disabled: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  ngOnInit(): void {
    this.resetForm();
    if (this.mode() == Mode.ADD) {
      this.submitButtonText.set('Add');
    } else if (this.mode() == Mode.EDIT) {
      this.submitButtonText.set('Edit');
    }
  }

  ngAfterViewInit(): void {
    this.ExerciseDisabled?.valueChanges.subscribe((value) => {
      if (value) {
        this.toggleText.set('Disabled');
      } else {
        this.toggleText.set('Enabled');
      }
    });

    this.ExerciseMiscDataType?.valueChanges.subscribe((value) => {
      this.enablePreview.set(false);
      this.togglePreview.set('See');
      this.ExerciseMiscData?.setValue('');
      this.openedFile.set(undefined);
      if (this.fileStatus() == 'Delete') {
        this.uploadOrDeleteLocalFile();
      }
      switch (value) {
        case MiscDataType.NONE:
          this.extraDataText.set('No Extra Data');
          this.ExerciseMiscData?.disable();
          break;
        case MiscDataType.IMAGE:
          this.extraDataText.set('Image link');
          this.localDataText.set('Image');
          this.acceptText.set('image/*');
          this.ExerciseMiscData?.enable();
          break;
        case MiscDataType.VIDEO:
          this.extraDataText.set('Video link');
          this.localDataText.set('Video');
          this.acceptText.set('video/mp4');
          this.ExerciseMiscData?.disable();
          break;
        case MiscDataType.EMBEDDED:
          this.extraDataText.set('Embedded Video link');
          this.ExerciseMiscData?.enable();
          break;
      }
    });

    this.ExerciseMiscData?.valueChanges.subscribe((miscValue) => {
      if (miscValue == null || miscValue == '') {
        this.enablePreview.set(false);
        this.togglePreview.set('See');
      }
    });
  }

  //Getters for formGroup

  get ExerciseName() {
    return this.formGroup.get('name');
  }

  get ExerciseDescription() {
    return this.formGroup.get('description');
  }

  get ExerciseMiscDataType() {
    return this.formGroup.get('miscDataType');
  }

  get ExerciseMiscData() {
    return this.formGroup.get('miscData');
  }

  get ExerciseDisabled() {
    return this.formGroup.get('disabled');
  }
  // valueOf functions
  valueOfS(obj: AbstractControl | null): string {
    return obj ? obj.value : '';
  }
  valueOfMDT(obj: AbstractControl | null): MiscDataType {
    return obj ? obj.value : MiscDataType.NONE;
  }
  valueOfB(obj: AbstractControl | null): boolean {
    return obj != null ? obj.value : false;
  }

  sToMDT(value: string | MiscDataType): MiscDataType {
    if (typeof value == 'string') {
      switch (value) {
        case 'NONE':
          return MiscDataType.NONE;
        case 'IMAGE':
          return MiscDataType.IMAGE;
        case 'VIDEO':
          return MiscDataType.VIDEO;
        case 'EMBEDDED':
          return MiscDataType.EMBEDDED;
        default:
          return MiscDataType.NONE;
      }
    } else {
      return value;
    }
  }

  // Async validators
  exerciseNameValidator(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    const name: string = control.value;

    if (this.exerciseNameAlreadyExists(name)) {
      return of({ notUnique: true });
    }
    return of(null);
  }

  onSubmit() {
    this.callback.emit({
      data: {
        exId: this.exercise()?.exId ?? 0,
        name: this.valueOfS(this.ExerciseName),
        description: this.valueOfS(this.ExerciseDescription),
        miscDataType: this.valueOfMDT(this.ExerciseMiscDataType),
        miscData: this.valueOfS(this.ExerciseMiscData),
        disabled: this.valueOfB(this.ExerciseDisabled),
      },
      submit: true,
    });
  }

  resetForm() {
    type ExerciseWithoutID = Omit<Exercise, 'exId'>;
    let resetValues: ExerciseWithoutID;
    resetValues = {
      name: '',
      description: '',
      miscDataType: MiscDataType.NONE,
      miscData: '',
      disabled: false,
    };
    this.formGroup.reset(resetValues);
    if (this.mode() == Mode.EDIT) {
      setTimeout(() => {
        let ex = this.exercise();
        if (ex != undefined) {
          this.ExerciseName?.setValue(ex.name);
          this.ExerciseDescription?.setValue(ex.description);
          const eMDT = this.sToMDT(ex.miscDataType);
          this.ExerciseMiscDataType?.setValue(eMDT);
          this.ExerciseMiscData?.setValue(ex.miscData);
          if (eMDT == MiscDataType.IMAGE || eMDT == MiscDataType.EMBEDDED) {
            this.ExerciseMiscData?.enable();
          } else {
            this.ExerciseMiscData?.disable();
          }
          this.ExerciseDisabled?.setValue(ex.disabled);
        }
      }, 100);
    }
  }

  cancelForm() {
    this.callback.emit({
      data: {
        name: '',
        description: '',
        disabled: false,
        exId: 0,
        miscData: '',
        miscDataType: MiscDataType.NONE,
      },
      submit: false,
    });
  }

  file_mock_input_changeEvent(event: Event) {
    if (this.file_mock_input?.nativeElement.files?.length == 1) {
      let temp = this.file_mock_input.nativeElement.files.item(0);
      if (temp) this.openedFile.set(temp);
    }
  }

  openFileDialog() {
    if (this.file_mock_input) {
      this.file_mock_input.nativeElement.click();
    }
  }

  uploadOrDeleteLocalFile() {
    const oF = this.openedFile();
    const oFName = this.uploadedFileName();
    if (oF && oFName == undefined) {
      if (this.fileStatus() == 'Upload') {
        if (this.localDataText() == 'Image') {
          this.fileSharingService
            .uploadFile(oF, 'images')
            .pipe(take(1))
            .subscribe((value) => {
              if (value) {
                console.log('Jimbarlakka', value);
                this.uploadedFileName.set( value);

                this.ExerciseMiscData?.setValue(
                  environment.api_url + 'files/images/view/' + value
                );
                this.fileStatus.set('Delete');
              }
            });
        } else if (this.localDataText() == 'Video') {
          this.fileSharingService
            .uploadFile(oF, 'videos')
            .pipe(take(1))
            .subscribe((value) => {
              if (value) {
                console.log('Jimbarlakka', value);
                this.uploadedFileName.set( value);

                this.ExerciseMiscData?.setValue(
                  environment.api_url + 'files/videos/view/' + value
                );
                this.fileStatus.set('Delete');
              }
            });
        }
      }
    } else if(oFName){
      if (this.fileStatus() == 'Delete') {
        if (this.enablePreview()) {
          this.openPreview();
        }
        if (this.localDataText() == 'Image') {
          this.fileSharingService
            .deleteFile(oFName, 'images')
            .pipe(take(1))
            .subscribe((value) => {
              if (value == 1) {
                console.log('Jimbarlakka', value);

                this.ExerciseMiscData?.setValue('');
                this.uploadedFileName.set(undefined);
                this.fileStatus.set('Upload');
              }
            });
        } else if (this.localDataText() == 'Video') {
          this.fileSharingService
            .deleteFile(oFName, 'videos')
            .pipe(take(1))
            .subscribe((value) => {
              if (value == 1) {
                console.log('Jimbarlakka', value);

                this.ExerciseMiscData?.setValue('');
                this.uploadedFileName.set(undefined);
                this.fileStatus.set('Upload');
              }
            });
        }
      }
    }
  }

  openPreview() {
    if (this.enablePreview()) {
      this.previewData.set(undefined);
      this.enablePreview.set(false);
      this.togglePreview.set('See');
      return;
    }
    const dt = this.valueOfMDT(this.ExerciseMiscDataType);
    const value = this.valueOfS(this.ExerciseMiscData);
    if (value != '') {
      switch (dt) {
        case MiscDataType.IMAGE:
          if (this.checkIfLocalFile(value)) {
            this.fileSharingService
              .viewImageFile(value)
              .pipe(take(1))
              .subscribe({
                next: (result) =>
                  result.pipe(take(1)).subscribe((imgSrc) => {
                    this.previewData.set(imgSrc);
                    this.enablePreview.set(true);
                    this.togglePreview.set('Close');
                    // this.changeDetection.detectChanges();
                  }),
                error: (err) => console.log(err),
              });
          } else {
            this.previewData.set(value);
            this.enablePreview.set(true);
            this.togglePreview.set('Close');
          }
          break;
        case MiscDataType.VIDEO:
          if (this.checkIfLocalFile(value)) {
            this.fileSharingService
              .viewVideoFile(value)
              .pipe(take(1))
              .subscribe((vidSrc) => {
                if (vidSrc) {
                  this.previewData.set(vidSrc);
                  this.enablePreview.set(true);
                  this.togglePreview.set('Close');
                  // this.changeDetection.detectChanges();
                }
              });
          } else {
            this.previewData.set(value);
            this.enablePreview.set(true);
            this.togglePreview.set('Close');
          }
          break;
        case MiscDataType.EMBEDDED:
          this.previewData.set(value);
          const pd = this.previewData();
          if (pd)
            this.sanitizedSafeHtml.set(
              this.sanitizer.bypassSecurityTrustHtml(pd)
            );
          this.enablePreview.set(true);
          this.togglePreview.set('Close');
          break;
      }
    }
  }

  setSanitizedUrl(pd: string) {
    this.sanitizedSrc.set(this.sanitizer.bypassSecurityTrustUrl(pd));
  }

  exerciseNameAlreadyExists(name: string): boolean {
    let editData = this.exercise();
    for (let ex of this.allExercisesData()) {
      if (
        this.mode() == Mode.EDIT &&
        editData != undefined &&
        ex.name.toLowerCase().startsWith(editData.name.toLowerCase())
      ) {
        continue;
      }
      if (ex.name.toLowerCase().startsWith(name.trim().toLowerCase())) {
        return true;
      }
    }
    return false;
  }

  checkIfLocalFile(url: string): boolean {
    return url.startsWith(environment.api_url);
  }
}
