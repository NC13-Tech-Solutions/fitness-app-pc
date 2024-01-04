import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, firstValueFrom, map, take } from 'rxjs';
import { months } from 'src/app/services/ctrl/months.reducer';
import { DayService } from 'src/app/services/http/day.service';
import { DayData } from 'src/app/shared/models/day-data.model';
import { DayWeeksMonthYear } from 'src/app/shared/models/day-weeks-month-year.model';
import { Mode } from 'src/app/shared/models/mode.model';

@Component({
  selector: 'app-view-day',
  templateUrl: './view-day.component.html',
  styleUrls: ['./view-day.component.sass'],
})
export class ViewDayComponent implements OnInit {
  private router = inject(Router);
  private dayService = inject(DayService);
  store = inject(Store<{ dmy: DayWeeksMonthYear }>);
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

  ngOnInit(): void {
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

  async getThisDateData(): Promise<string> {
    const monthData = await firstValueFrom(this.monthText);
    const yearData = await firstValueFrom(this.yearValue);
    const monthInNums = months.indexOf(monthData);
    const dayData = await firstValueFrom(this.dayValue);

    return dayData + '/' + monthInNums + '/' + yearData;
  }

  addWorkoutBtnDisabled(): boolean {
    if (this.dayData != undefined) return true;
    if (this.mode == Mode.ADD || this.mode == Mode.EDIT) return true;
    return true;
  }

  addDayData(){
    this.mode = Mode.ADD;
    this.editDayData = undefined;
  }

  addWorkout() {}

  close_nav() {
    this.router.navigateByUrl('/main');
  }
}
