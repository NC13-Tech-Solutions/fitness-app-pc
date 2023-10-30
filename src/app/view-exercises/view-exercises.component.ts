import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { Observable, take } from 'rxjs';
import { Exercise } from '../shared/models/exercise.model';
import { MatDialog } from '@angular/material/dialog';
import { EditDialogComponent } from '../shared/dialogs/edit-dialog/edit-dialog.component';
import { MiscDataType } from '../shared/models/misc-data-type.model';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';

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

  extraDataType = MiscDataType;

  public editDialog = inject(MatDialog);

  public stepIndex = -1;

  public exerciseTrackingFn(index: number, value: Exercise): Exercise {
    return value;
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
}
