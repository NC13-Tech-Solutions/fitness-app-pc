import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  inject,
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
import { ExerciseService } from '../../services/http/exercise.service';
import { Observable, of, take } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FileSharingService } from '../../services/http/file-sharing.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-add-or-edit-exercise',
  templateUrl: './add-or-edit-exercise.component.html',
  styleUrls: ['./add-or-edit-exercise.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddOrEditExerciseComponent implements AfterViewInit, OnInit {
  @Input() mode: Mode = Mode.ADD;
  @Input() exercise: Exercise | undefined;
  @Output() callback = new EventEmitter<{ data: Exercise; submit: boolean }>();
  private sanitizer = inject(DomSanitizer);
  private exerciseService = inject(ExerciseService);
  private fileSharingService = inject(FileSharingService);
  private exercisesData: Exercise[] = [];

  toggleText: 'Enabled' | 'Disabled' = 'Enabled';
  togglePreview: 'See' | 'Close' = 'See';
  submitButtonText: 'Add' | 'Edit' = 'Add';
  acceptText: 'image/*' | 'video/mp4' = 'image/*';
  extraDataText:
    | 'No Extra Data'
    | 'Image link'
    | 'Video link'
    | 'Embedded Video link' = 'No Extra Data';
  localDataText: 'Image' | 'Video' = 'Image';
  fileStatus: 'Upload' | 'Delete' = 'Upload';
  exerciseMode = Mode;
  extraDataType = MiscDataType;
  enablePreview = false;
  @ViewChild('file_mock_input') file_mock_input:
    | ElementRef<HTMLInputElement>
    | undefined;
  previewData = '';
  sanitizedSafeHtml: SafeHtml = '';
  openedFile: File | undefined;
  uploadedFileName = '';

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
    this.exerciseService
      .getAllExercises()
      .pipe(take(1))
      .subscribe((value) => {
        value.forEach((ex) => this.exercisesData.push(ex));
      });
    this.resetForm();
    if (this.mode == Mode.ADD) {
      this.submitButtonText = 'Add';
    } else if (this.mode == Mode.EDIT) {
      this.submitButtonText = 'Edit';
    }
  }

  ngAfterViewInit(): void {
    this.ExerciseDisabled?.valueChanges.subscribe((value) => {
      if (value) {
        this.toggleText = 'Disabled';
      } else {
        this.toggleText = 'Enabled';
      }
    });

    this.ExerciseMiscDataType?.valueChanges.subscribe((value) => {
      this.enablePreview = false;
      this.togglePreview = 'See';
      this.ExerciseMiscData?.setValue('');
      this.openedFile = undefined;
      if (this.fileStatus == 'Delete') {
        this.uploadOrDeleteLocalFile();
      }
      switch (value) {
        case MiscDataType.NONE:
          this.extraDataText = 'No Extra Data';
          this.ExerciseMiscData?.disable();
          break;
        case MiscDataType.IMAGE:
          this.extraDataText = 'Image link';
          this.localDataText = 'Image';
          this.acceptText = 'image/*';
          this.ExerciseMiscData?.enable();
          break;
        case MiscDataType.VIDEO:
          this.extraDataText = 'Video link';
          this.localDataText = 'Video';
          this.acceptText = 'video/mp4';
          this.ExerciseMiscData?.disable();
          break;
        case MiscDataType.EMBEDDED:
          this.extraDataText = 'Embedded Video link';
          this.ExerciseMiscData?.enable();
          break;
      }
    });

    this.ExerciseMiscData?.valueChanges.subscribe((miscValue) => {
      if (miscValue == null || miscValue == '') {
        this.enablePreview = false;
        this.togglePreview = 'See';
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
        exId: this.exercise?.exId ?? 0,
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
    if (this.mode == Mode.EDIT) {
      setTimeout(() => {
        if (this.exercise != undefined) {
          this.ExerciseName?.setValue(this.exercise.name);
          this.ExerciseDescription?.setValue(this.exercise.description);
          const eMDT = this.sToMDT(this.exercise.miscDataType);
          this.ExerciseMiscDataType?.setValue(eMDT);
          this.ExerciseMiscData?.setValue(this.exercise.miscData);
          if (eMDT == MiscDataType.IMAGE || eMDT == MiscDataType.EMBEDDED) {
            this.ExerciseMiscData?.enable();
          } else {
            this.ExerciseMiscData?.disable();
          }
          this.ExerciseDisabled?.setValue(this.exercise.disabled);
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
      if (temp) this.openedFile = temp;
    }
  }

  openFileDialog() {
    if (this.file_mock_input) {
      this.file_mock_input.nativeElement.click();
    }
  }

  uploadOrDeleteLocalFile() {
    if (this.openedFile && this.uploadedFileName == '') {
      if (this.fileStatus == 'Upload') {
        if (this.localDataText == 'Image') {
          this.fileSharingService
            .uploadFile(this.openedFile, 'images')
            .pipe(take(1))
            .subscribe((value) => {
              if (value) {
                console.log('Jimbarlakka', value);
                this.uploadedFileName = value;

                this.ExerciseMiscData?.setValue(
                  environment.api_url + 'files/images/view/' + value
                );
                this.fileStatus = 'Delete';
              }
            });
        } else if (this.localDataText == 'Video') {
          this.fileSharingService
            .uploadFile(this.openedFile, 'videos')
            .pipe(take(1))
            .subscribe((value) => {
              if (value) {
                console.log('Jimbarlakka', value);
                this.uploadedFileName = value;

                this.ExerciseMiscData?.setValue(
                  environment.api_url + 'files/videos/view/' + value
                );
                this.fileStatus = 'Delete';
              }
            });
        }
      }
    } else {
      if (this.fileStatus == 'Delete') {
        if (this.enablePreview) {
          this.openPreview();
        }
        if (this.localDataText == 'Image') {
          this.fileSharingService
            .deleteFile(this.uploadedFileName, 'images')
            .pipe(take(1))
            .subscribe((value) => {
              if (value == 1) {
                console.log('Jimbarlakka', value);

                this.ExerciseMiscData?.setValue('');
                this.uploadedFileName = '';
                this.fileStatus = 'Upload';
              }
            });
        } else if (this.localDataText == 'Video') {
          this.fileSharingService
            .deleteFile(this.uploadedFileName, 'videos')
            .pipe(take(1))
            .subscribe((value) => {
              if (value == 1) {
                console.log('Jimbarlakka', value);

                this.ExerciseMiscData?.setValue('');
                this.uploadedFileName = '';
                this.fileStatus = 'Upload';
              }
            });
        }
      }
    }
  }

  openPreview() {
    if (this.enablePreview) {
      this.previewData = '';
      this.enablePreview = false;
      this.togglePreview = 'See';
      return;
    }
    const dt = this.valueOfMDT(this.ExerciseMiscDataType);
    const value = this.valueOfS(this.ExerciseMiscData);
    if (value != '') {
      switch (dt) {
        case MiscDataType.IMAGE:
          this.previewData = value;
          this.enablePreview = true;
          this.togglePreview = 'Close';
          break;
        case MiscDataType.VIDEO:
          this.previewData = value;
          this.enablePreview = true;
          this.togglePreview = 'Close';
          break;
        case MiscDataType.EMBEDDED:
          this.previewData = value;
          this.sanitizedSafeHtml = this.sanitizer.bypassSecurityTrustHtml(
            this.previewData
          );
          this.enablePreview = true;
          this.togglePreview = 'Close';
          break;
      }
    }
  }

  getSanitizedHtml() {
    return this.sanitizedSafeHtml;
  }

  getSanitizedUrl() {
    return this.sanitizer.bypassSecurityTrustUrl(this.previewData);
  }

  exerciseNameAlreadyExists(name: string): boolean {
    for (let ex of this.exercisesData) {
      if (
        this.mode == Mode.EDIT &&
        this.exercise != undefined &&
        ex.name.toLowerCase().startsWith(this.exercise.name.toLowerCase())
      ) {
        continue;
      }
      if (ex.name.toLowerCase().startsWith(name.trim().toLowerCase())) {
        return true;
      }
    }
    return false;
  }
}
