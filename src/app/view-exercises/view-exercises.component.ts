import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  TrackByFunction,
  inject,
} from '@angular/core';
import { ExerciseService } from '../services/http/exercise.service';
import { Observable, take } from 'rxjs';
import { Exercise } from '../shared/models/exercise.model';
import { MatDialog } from '@angular/material/dialog';
import { EditDialogComponent } from '../shared/dialogs/edit-dialog/edit-dialog.component';

@Component({
  selector: 'app-view-exercises',
  templateUrl: './view-exercises.component.html',
  styleUrls: ['./view-exercises.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewExercisesComponent {
  @Input() exercises: Observable<Exercise[]> | undefined;
  @Output() callback = new EventEmitter<Exercise>();

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
}
