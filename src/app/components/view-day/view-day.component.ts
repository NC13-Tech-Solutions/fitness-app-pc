import { Component, OnInit, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, firstValueFrom, map, take } from 'rxjs';
import { resetSelection } from 'src/app/services/ctrl/exercise-selections.actions';
import { DayService } from 'src/app/services/http/day.service';
import { DateData } from 'src/app/shared/models/date-data.model';
import { DayData } from 'src/app/shared/models/day-data.model';
import { DayWeeksMonthYear } from 'src/app/shared/models/day-weeks-month-year.model';
import { ExerciseSelected } from 'src/app/shared/models/exercise-selected.model';
import { Mode } from 'src/app/shared/models/mode.model';

@Component({
  selector: 'app-view-day',
  templateUrl: './view-day.component.html',
  styleUrls: ['./view-day.component.sass'],
})
export class ViewDayComponent implements OnInit {
  private router = inject(Router);
  private snackbar = inject(MatSnackBar);
  private dayService = inject(DayService);
  store = inject(Store<{ dmy: DayWeeksMonthYear }>);
  exStore = inject(Store<{ exercisesSelected: ExerciseSelected[] }>);
  dmy: Observable<DayWeeksMonthYear> = this.store.select('months');
  dayValue: Observable<number> = this.dmy.pipe(
    map((snaps) => {
      return snaps.Day;
    })
  );
  monthText: Observable<string> = this.dmy.pipe(
    map((snaps) => {
      return snaps.Month;
    })
  );
  yearValue: Observable<number> = this.dmy.pipe(
    map((snaps) => {
      return snaps.Year;
    })
  );

  mode: Mode = Mode.VIEW;
  dayViewMode = Mode;

  dayData: DayData | undefined;
  editDayData: DayData | undefined;
  currentDay: DateData | undefined;

  ngOnInit(): void {
    this.refreshDayData();
  }

  async getThisDateData(): Promise<DateData> {
    const monthData = await firstValueFrom(this.monthText);
    const yearData = await firstValueFrom(this.yearValue);
    const dayData = await firstValueFrom(this.dayValue);

    return { day: dayData, month: monthData, year: yearData };
  }

  addWorkoutBtnDisabled(): boolean {
    if (this.dayData != undefined) return true;
    if (this.mode == Mode.ADD || this.mode == Mode.EDIT) return true;
    return true;
  }

  addDayData() {
    this.getThisDateData().then((value) => {
      this.currentDay = value;
      this.mode = Mode.ADD;
      this.editDayData = undefined;
      this.exStore.dispatch(resetSelection());
    });
  }

  addWorkout() {
    // FIXME: To add a workout schedule for the day
  }

  close_nav() {
    this.router.navigateByUrl('/main');
  }

  addOrEditDay(value: { data: DayData; submit: boolean }) {
    if (value.submit) {
      if (this.mode == Mode.ADD) {
        this.dayService
          .addDayData(value.data)
          .pipe(take(1))
          .subscribe((x) => {
            if (x == 1) {
            }
          });
      }
    } else {
      this.mode = Mode.VIEW;
      this.editDayData = undefined;
      this.exStore.dispatch(resetSelection());
    }
  }

  refreshDayData() {
    this.getThisDateData().then(
      (value) => {
        this.dayService
          .getDayData(value)
          .pipe(take(1))
          .subscribe((value) => {
            if (value != null) {
              this.dayData = value;
            }
          });
      },
      (err) => {
        console.log('Moonjakkam', err);
      }
    );
  }

  onFormSubmit(result: { data: DayData; submit: boolean }) {
    // FIXME: On day data form submit
    console.log(result);
  }
}
