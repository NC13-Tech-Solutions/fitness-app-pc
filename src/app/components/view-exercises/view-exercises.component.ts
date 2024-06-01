import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { Observable, take } from 'rxjs';
import { Exercise } from '../../shared/models/exercise.model';
import { MatDialog } from '@angular/material/dialog';
import { EditDialogComponent } from '../../shared/dialogs/edit-dialog/edit-dialog.component';
import { MiscDataType } from '../../shared/models/misc-data-type.model';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';
import { FileSharingService } from 'src/app/services/http/file-sharing.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-view-exercises',
  templateUrl: './view-exercises.component.html',
  styleUrls: ['./view-exercises.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewExercisesComponent {
  @Input() exercises: Observable<Exercise[]> | undefined;
  @Output() callback = new EventEmitter<Exercise>();
  private sanitizer = inject(DomSanitizer);
  private fileSharingService = inject(FileSharingService);

  private data$: {obs: Observable<string>, exId: number}[] = [];

  extraDataType = MiscDataType;
  panelOpenData: { openedIndex: number; state: boolean } = {
    openedIndex: 0,
    state: false,
  };

  public editDialog = inject(MatDialog);

  public stepIndex = -1;

  public exerciseTrackingFn(index: number, value: Exercise): number {
    return value.exId;
  }

  public setStep(x: number) {
    this.stepIndex = x;
  }

  nextStep() {
    this.stepIndex++;
  }
  prevStep() {
    this.stepIndex--;
  }

  editExercise(value: Exercise) {
    const dialogRef = this.editDialog.open(EditDialogComponent, {
      data: { name: value.name, type: 'Exercise' },
    });
    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((result: boolean) => {
        if (result) {
          this.callback.emit(value);
        }
      });
  }

  loadFile(fileUrl: string, exerciseId: number): Observable<string>{
    const x = this.checkIfDataStreamIsAvailable(exerciseId);
    if(x == undefined){
      const newData = new Observable<string>((observer) => {
        if (this.checkIfLocalFile(fileUrl)) {
          this.fileSharingService
            .viewFileWithUrl(fileUrl)
            .pipe(take(1))
            .subscribe({
              next: (value) =>
                value.pipe(take(1)).subscribe((result) => {
                  observer.next(result);
                  observer.complete();
                }),
              error: (err) => console.log(err),
            });
        } else {
          observer.next(fileUrl);
          observer.complete();
        }
      });
      this.data$.push({ obs: newData, exId: exerciseId });
      return newData;
    }else
    return x;
  }

  checkIfDataStreamIsAvailable(exId: number): Observable<string> | undefined{
    for(let x of this.data$){
      if(x.exId == exId){
        return x.obs;
      }
    }
    return undefined;
  }

  checkIfLocalFile(url: string): boolean {
    return url.startsWith(environment.api_url);
  }

  getSanitizedUrl(value: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(value);
  }

  getSanitizedHtml(value: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value);
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

  shortDescription(inputText: string, index: number): string {
    if (this.panelOpenData.openedIndex == index && this.panelOpenData.state)
      return 'Description';
    if (inputText.length < 50) {
      return inputText;
    }
    return inputText.substring(0, 47) + '...';
  }

  panelOpened(index: number) {
    this.panelOpenData.openedIndex = index;
    this.panelOpenData.state = true;
  }

  panelClosed(index: number) {
    if (this.stepIndex != -1 && this.stepIndex != index) return; //This code is needed as other accordions closing will also trigger this function
    this.panelOpenData.openedIndex = index;
    this.panelOpenData.state = false;
  }
}
