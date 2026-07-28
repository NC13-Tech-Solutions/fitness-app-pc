import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  WritableSignal,
  computed,
  effect,
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
import { BehaviorSubject, Observable, of, take } from 'rxjs';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';
import { FileSharingService } from '../../services/http/file-sharing.service';
import { environment } from 'src/environments/environment';
import { SelectionsStore } from 'src/app/services/ctrl/selections.store';
import { FormStatus } from 'src/app/shared/models/form-status.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-add-or-edit-exercise',
    templateUrl: './add-or-edit-exercise.component.html',
    styleUrls: ['./add-or-edit-exercise.component.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class AddOrEditExerciseComponent implements AfterViewInit, OnInit {
  mode = input<Mode>(Mode.ADD);
  exercise = input<Exercise>();
  allExercisesData = input.required<Exercise[]>();
  callback = output<{ data: Exercise; submit: boolean }>();
  private sanitizer = inject(DomSanitizer);
  private fileSharingService = inject(FileSharingService);
  private store = inject(SelectionsStore);
  private snackbar = inject(MatSnackBar);

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
  openedFile: WritableSignal<File | string | undefined> = signal(undefined);
  uploadedFileName: WritableSignal<string | undefined> = signal(undefined);

  formStatus = computed(() => this.store.mainFormStatus());

  formStatusBS = new BehaviorSubject<FormStatus>(FormStatus.OKAY);
  formStatus$ = this.formStatusBS.asObservable();

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
      { nonNullable: true },
    ),
    disabled: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor() {
    this.store.resetSelection();
    effect(
      () => {
        const fs = this.formStatus();
        const fsbs = this.formStatusBS.getValue();
        if (fs != fsbs) {
          this.formStatusBS.next(fs);
        }
      },
      { allowSignalWrites: true },
    );
  }

  ngOnInit(): void {
    this.resetForm();
    if (this.mode() == Mode.ADD) {
      this.submitButtonText.set('Add');
    } else if (this.mode() == Mode.EDIT) {
      this.submitButtonText.set('Edit');
    }

    this.formStatus$.subscribe((value) => {
      console.log('====================================');
      switch (value) {
        case FormStatus.CANCEL:
          // Form is being cancelled. So delete files, if necessary
          console.log('Form Cancelled');
          this.cancelFormFR(() => this.deleteData());
          break;
        case FormStatus.RESET:
          // Form is being reset. So restore edit data and delete files, if necessary
          console.log('Form Reset');
          this.resetFormFR(() => this.deleteData()).then(() => {
            setTimeout(() => {
              this.store.changeMainFormStatus(FormStatus.OKAY);
            }, 200);
          });
          break;
        case FormStatus.SUBMIT:
          console.log('Form Submitted');
          this.submitForm(() => this.deletePrevData());
          break;
        case FormStatus.OKAY:
        // Form is okay. Do anything, if necessary
        default:
          // Default is OKAY
          console.log('Form Okay aanu');
      }
      console.log('====================================');
    });
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
      this.ExerciseMiscData?.clearValidators();
      this.ExerciseMiscData?.setValue('');
      this.openedFile.set(undefined);
      if (
        this.formStatus() == FormStatus.OKAY &&
        this.fileStatus() == 'Delete'
      ) {
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
          this.ExerciseMiscData?.addValidators([Validators.required]);
          break;
        case MiscDataType.VIDEO:
          this.extraDataText.set('Video link');
          this.localDataText.set('Video');
          this.acceptText.set('video/mp4');
          this.ExerciseMiscData?.disable();
          this.ExerciseMiscData?.addValidators([Validators.required]);
          break;
        case MiscDataType.EMBEDDED:
          this.extraDataText.set('Embedded Video link');
          this.ExerciseMiscData?.enable();
          this.ExerciseMiscData?.addValidators([Validators.required]);
          break;
      }
      setTimeout(() => {
        this.ExerciseMiscData?.updateValueAndValidity();
      }, 100);
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
    control: AbstractControl,
  ): Observable<ValidationErrors | null> {
    const name: string = control.value;

    if (this.exerciseNameAlreadyExists(name)) {
      return of({ notUnique: true });
    }
    return of(null);
  }

  onSubmit() {
    this.store.changeMainFormStatus(FormStatus.SUBMIT);
  }

  submitForm(callback: () => Promise<void>) {
    callback()
      .then(() => {
        this.store.changeMainFormStatus(FormStatus.OKAY);
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
      })
      .catch((err) => {
        console.log(err);
      });
  }

  resetForm() {
    console.log('Reset koduthu');

    this.store.changeMainFormStatus(FormStatus.RESET);
  }

  resetFormFR(callback: () => Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      callback()
        .then(() => {
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
                if (this.checkIfLocalFile(ex.miscData)) {
                  this.afterFileUpload();
                  this.uploadedFileName.set(ex.miscData);
                }
                if (
                  eMDT == MiscDataType.IMAGE ||
                  eMDT == MiscDataType.EMBEDDED
                ) {
                  this.ExerciseMiscData?.enable();
                } else {
                  this.ExerciseMiscData?.disable();
                }
                this.ExerciseDisabled?.setValue(ex.disabled);
              }
              resolve();
            }, 100);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }

  cancelForm() {
    console.log('Cancel cheythu');
    this.store.changeMainFormStatus(FormStatus.CANCEL);
  }

  cancelFormFR(callback: () => Promise<void>) {
    callback()
      .then(() => {
        this.store.changeMainFormStatus(FormStatus.OKAY);
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
      })
      .catch((err) => {
        console.log(err);
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
    if (oF && oFName == undefined && typeof oF != 'string') {
      if (this.fileStatus() == 'Upload') {
        if (this.localDataText() == 'Image') {
          this.fileSharingService
            .uploadFile(oF, 'images')
            .pipe(take(1))
            .subscribe((value) => {
              if (value) {
                console.log('Jimbarlakka', value);
                this.uploadedFileName.set(value);

                this.ExerciseMiscData?.setValue(
                  environment.api_url + 'files/images/view/' + value,
                );
                this.afterFileUpload();
              }
            });
        } else if (this.localDataText() == 'Video') {
          this.fileSharingService
            .uploadFile(oF, 'videos')
            .pipe(take(1))
            .subscribe((value) => {
              if (value) {
                console.log('Jimbarlakka', value);
                this.uploadedFileName.set(value);

                this.ExerciseMiscData?.setValue(
                  environment.api_url + 'files/videos/view/' + value,
                );
                this.afterFileUpload();
              }
            });
        }
      }
    } else if (oFName) {
      if (this.fileStatus() == 'Delete') {
        if (this.enablePreview()) {
          this.openPreview();
        }
        if (this.checkIfInEditData(oFName)) {
          // Since its in Edit Data, we should wait till form is submitted, to delete the file
          this.afterFileDelete();
        } else {
          // Not in Edit Data, so we can delete without any worries
          if (this.localDataText() == 'Image') {
            this.fileSharingService
              .deleteFile(oFName, 'images')
              .pipe(take(1))
              .subscribe((value) => {
                if (value == 1) {
                  console.log('Jimbarlakka', value);
                  this.afterFileDelete();
                }
              });
          } else if (this.localDataText() == 'Video') {
            this.fileSharingService
              .deleteFile(oFName, 'videos')
              .pipe(take(1))
              .subscribe((value) => {
                if (value == 1) {
                  console.log('Jimbarlakka', value);
                  this.afterFileDelete();
                }
              });
          }
        }
      }
    }
  }

  afterFileDelete() {
    this.ExerciseMiscData?.setValue('');
    this.uploadedFileName.set(undefined);
    this.openedFile.set(undefined);
    this.fileStatus.set('Upload');
  }

  afterFileUpload() {
    this.openedFile.set('Uploaded');
    this.fileStatus.set('Delete');
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
                    this.setSanitizedUrl(imgSrc);
                    this.afterOpenPreview();
                  }),
                error: (err) => console.log(err),
              });
          } else {
            this.previewData.set(value);
            this.setSanitizedUrl(value);
            this.afterOpenPreview();
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
                  this.setSanitizedUrl(vidSrc);
                  this.afterOpenPreview();
                }
              });
          } else {
            this.previewData.set(value);
            this.setSanitizedUrl(value);
            this.afterOpenPreview();
          }
          break;
        case MiscDataType.EMBEDDED:
          this.previewData.set(value);
          this.sanitizedSafeHtml.set(
            this.sanitizer.bypassSecurityTrustHtml(value),
          );
          break;
      }
    }
  }

  afterOpenPreview() {
    this.enablePreview.set(true);
    this.togglePreview.set('Close');
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
  /**
   * Checks if a given URL points to a local file.
   *
   * @param url The URL to check.
   * @returns Returns `true` if the URL starts with the local API URL, otherwise `false`.
   *
   * @example
   * checkIfLocalFile("http://localhost:9200/files/data.png"); // true
   * checkIfLocalFile("https://example.com/files/data.png"); // false
   */

  checkIfLocalFile(url: string): boolean {
    return url.startsWith(environment.api_url);
  }

  checkIfInEditData(url: string): boolean {
    if (this.mode() == Mode.EDIT) {
      //Current mode is Edit mode
      const e = this.exercise();
      // Checking if Edit Exercise data is available
      if (e) {
        // Checking if edit image or video url is same as url
        if (e.miscData == url) {
          return true;
        }
      }
    }
    return false;
  }

  deleteData(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const url = this.uploadedFileName();
      if (url === undefined) {
        // No urls needed to delete
        resolve();
      } else {
        // Checking if url is in edit data. If so, then we don't need to delete it as data can be restored.
        if (this.checkIfInEditData(url)) {
          // Url is in Edit Data, so we can skip adding it to delete queue
          resolve();
        } else {
          // Url is not in Edit Data and thus should be deleted
          this.store.addItemToDeletionQueue(
            url,
            this.localDataText() === 'Image' ? 'images' : 'videos',
          );
          this.afterFileDelete();
          this.store.deleteItemsFromDeletionQueue((data) => {
            return new Promise<number>((success, failed) => {
              if (data == null) {
                // This is sent from the clearData(), when the queue is empty
                this.snackbar.open('File Deleted', 'Dismiss', {
                  duration: 1000,
                });
                resolve();
              } else {
                this.fileSharingService
                  .deleteFile(data.fileName, data.type)
                  .pipe(take(1))
                  .subscribe((value) => {
                    if (value == 1) {
                      console.log('Jimbarlakka', value);
                    }
                    success(value);
                  });
              }
            });
          });
        }
      }
    });
  }

  deletePrevData(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const url = this.uploadedFileName();
      if (url !== undefined && this.checkIfInEditData(url)) {
        // Url is available and is in edit data. So no need to delete this
        resolve();
      } else {
        // Uploaded file is different from that in edit data. So we need to delete it.
        const ex = this.exercise();
        if (ex === undefined) {
          // Edit data is unavailable, so returning
          resolve();
        } else {
          const eMDT = this.sToMDT(ex.miscDataType);
          // Edit Data is available. So checking if the file is of image or video data type.
          if (eMDT == MiscDataType.IMAGE || eMDT == MiscDataType.VIDEO) {
            // Checking if the file is local
            if (this.checkIfLocalFile(ex.miscData)) {
              // File is local so deleting it
              this.store.addItemToDeletionQueue(
                this.justFileName(ex.miscData, eMDT),
                eMDT === MiscDataType.IMAGE ? 'images' : 'videos',
              );
              this.afterFileDelete();
              this.store.deleteItemsFromDeletionQueue((data) => {
                return new Promise<number>((success, failed) => {
                  if (data == null) {
                    // This is sent from the clearData(), when the queue is empty
                    this.snackbar.open('File Deleted', 'Dismiss', {
                      duration: 1000,
                    });
                    resolve();
                  } else {
                    this.fileSharingService
                      .deleteFile(data.fileName, data.type)
                      .pipe(take(1))
                      .subscribe((value) => {
                        if (value == 1) {
                          console.log('Jimbarlakka', value);
                        }
                        success(value);
                      });
                  }
                });
              });
            } else {
              // File is not local, so no need to delete it. So returning
              resolve();
            }
          } else {
            // Previous data is not a video or image so returning
            resolve();
          }
        }
      }
    });
  }

  justFileName(
    url: string,
    type: MiscDataType.IMAGE | MiscDataType.VIDEO,
  ): string {
    let subStr = environment.api_url + 'files/';
    if (type == MiscDataType.IMAGE) {
      subStr = subStr + 'images/view/';
    } else {
      subStr = subStr + 'videos/view/';
    }
    return url.substring(subStr.length);
  }
}
