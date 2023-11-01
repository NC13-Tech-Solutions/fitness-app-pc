import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  decrementMonth,
  incrementMonth,
  reset,
} from '../services/ctrl/months.actions';
import { WeeksMonthYear } from '../shared/models/weeks-month-year.model';
import { Observable, map, take } from 'rxjs';
import { UserService } from '../services/http/user.service';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent {
  router = inject(Router);
  store = inject(Store<{ dmy: WeeksMonthYear }>);
  userService = inject(UserService);

  dmy: Observable<WeeksMonthYear> = this.store.select('months');
  monthText: Observable<string> = this.dmy.pipe(
    map((snaps) => {
      return snaps.Month;
    })
  );
  weeksArray: Observable<number[][]> = this.dmy.pipe(
    map((snaps) => {
      return snaps.Weeks;
    })
  );
  yearValue: Observable<number> = this.dmy.pipe(
    map((snaps) => {
      return snaps.Year;
    })
  );

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

  showWorkouts() {}

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
    console.log('Moonjakkam', value);

    const x: number[] = [];
    for (let i = 0; i < value; i++) x.push(i);
    return x;
  }

  howManyWorkoutsThatDay(day: number): number {
    // TODO: need to extract day info here. remove code once done
    return day % 2 == 0 ? 1 : 0;
  }

  dayClicked(day: number) {
    console.log('Jimbarlakka', day);
  }
}
