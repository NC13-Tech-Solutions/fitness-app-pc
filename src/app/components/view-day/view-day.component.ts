import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
import { DayWeeksMonthYear } from 'src/app/shared/models/day-weeks-month-year.model';

@Component({
  selector: 'app-view-day',
  templateUrl: './view-day.component.html',
  styleUrls: ['./view-day.component.sass'],
})
export class ViewDayComponent {
  private router = inject(Router);
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

  addWorkout() {
  }
  close_nav() {
    this.router.navigateByUrl('/main');
  }
}
