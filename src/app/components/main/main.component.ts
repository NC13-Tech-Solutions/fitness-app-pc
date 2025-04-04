import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  decrementMonth,
  incrementMonth,
  reset,
  setDay,
} from '../../services/ctrl/months.actions';
import { DayWeeksMonthYear } from '../../shared/models/day-weeks-month-year.model';
import { Observable, map, take } from 'rxjs';
import { UserService } from '../../services/http/user.service';
import { MatDrawer } from '@angular/material/sidenav';
import { DayService } from 'src/app/services/http/day.service';
import { DayData } from 'src/app/shared/models/day-data.model';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent implements OnInit {
  router = inject(Router);
  store = inject(Store<{ months: DayWeeksMonthYear }>);
  userService = inject(UserService);
  dayService = inject(DayService);
  private changeDetection = inject(ChangeDetectorRef);

  dmy: Observable<DayWeeksMonthYear> = this.store.select('months');
  dayValueData$: Observable<number> = this.dmy.pipe(
    map((snaps) => {
      return snaps.Day;
    })
  );
  monthData$: Observable<string> = this.dmy.pipe(
    map((snaps) => {
      return snaps.Month;
    })
  );
  weeksArray: Observable<number[][]> = this.dmy.pipe(
    map((snaps) => {
      return snaps.Weeks;
    })
  );
  yearData$: Observable<number> = this.dmy.pipe(
    map((snaps) => {
      return snaps.Year;
    })
  );

  dayDataArraySignal:WritableSignal<DayData[]> = signal<DayData[]>([]);

  monthData: string | undefined;
  yearData: number | undefined;
  dayValueData:WritableSignal<number> = signal(0);

  ngOnInit(): void {
    this.monthData$.subscribe((x) => {
      console.log(x);
      this.monthData = x;
    });
    this.yearData$.subscribe((y) => {
      console.log(y);
      this.yearData = y;
    });

    this.dayValueData$.subscribe((z) => {
      console.log(z);
      console.log('===============', new Date());

      this.dayValueData.set(z == -1 ? 0 : z);
      this.getDayDataOfMonth();
    });
  }

  logOut() {
    this.userService
      .logOut()
      .pipe(take(1))
      .subscribe((value) => {
        if (value) {
          this.router.navigateByUrl('/login');
        }
      });
  }

  showExercises() {
    this.router.navigateByUrl('/exercises');
  }

  showWorkouts() {
    // FIXME: Navigate to Workout Schedules page
  }

  close_exercises_nav(elemRef: MatDrawer) {
    elemRef.close();
  }

  goToPrevMonth() {
    this.store.dispatch(decrementMonth());
  }

  goToNextMonth() {
    this.store.dispatch(incrementMonth());
  }

  goToCurrentMonth() {
    this.store.dispatch(reset());
  }

  fillerDays(value: number): Array<number> {
    const x: number[] = [];
    for (let i = 0; i < value; i++) x.push(i);
    return x;
  }

  howManyWorkoutsThatDay(day: number): number {
    // FIXME: need to extract day info here. remove code once done
    if (this.monthData != undefined && this.yearData != undefined) {
      let x = this.getDayDataByDMY(day, this.monthData, this.yearData);
      if (x != undefined) {
        return x.workouts.length;
      }
    }
    return 0;
  }

  dayClicked(day: number) {
    this.store.dispatch(setDay({ day }));
    this.router.navigateByUrl('/day');
  }

  getDayDataOfMonth() {
    if (this.monthData != undefined && this.yearData != undefined) {
      this.dayService
        .getDayDataForMonth({
          day: 1,
          month: this.monthData,
          year: this.yearData,
        })
        .pipe(take(1))
        .subscribe((x) => {
          if (x != null) {
            console.log(x);
            this.dayDataArraySignal.set(x);
          }
        });
    }
  }

  getDayDataByDMY(
    day: number,
    month: string,
    year: number
  ): DayData | undefined {
    for (let x of this.dayDataArraySignal()) {
      if (
        x.postedOn.day == day &&
        x.postedOn.month === month &&
        x.postedOn.year === year
      ) {
        return x;
      }
    }
    return undefined;
  }
}
