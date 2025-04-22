import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  Signal,
  WritableSignal,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { UserService } from '../../services/http/user.service';
import { MatDrawer } from '@angular/material/sidenav';
import { DayService } from 'src/app/services/http/day.service';
import { DayData } from 'src/app/shared/models/day-data.model';
import { MonthStore } from 'src/app/services/ctrl/months.store';
import { DateData } from 'src/app/shared/models/date-data.model';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent {
  router = inject(Router);
  store = inject(MonthStore);
  userService = inject(UserService);
  dayService = inject(DayService);
  private changeDetection = inject(ChangeDetectorRef);

  daySignal: Signal<number> = computed(() => {
    const x = this.store.Day();
    return x == -1 ? 0 : x;
  });
  monthSignal: Signal<string> = computed(() => this.store.Month());
  yearSignal: Signal<number> = computed(() => this.store.Year());
  weeksArraySignal: Signal<number[][]> = computed(() => this.store.Weeks());

  dayDataArraySignal: WritableSignal<DayData[]> = signal<DayData[]>([]);

  constructor(){
    effect(() =>{
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
    this.store.decrementMonth();
  }

  goToNextMonth() {
    this.store.incrementMonth();
  }

  goToCurrentMonth() {
    this.store.reset();
  }

  fillerDays(value: number): Array<number> {
    const x: number[] = [];
    for (let i = 0; i < value; i++) x.push(i);
    return x;
  }

  howManyWorkoutsThatDay(day: number): number {
    // FIXME: need to extract day info here. remove code once done
    let x = this.getDayDataByDMY(day, this.monthSignal(), this.yearSignal());
    if (x != undefined) {
      return x.workouts.length;
    }
    return 0;
  }

  dayClicked(day: number) {
    this.store.setDay(day);
    this.router.navigateByUrl('/day');
  }

  getDayDataOfMonth() {
    if (this.monthSignal() != undefined && this.yearSignal() != undefined) {
      this.dayService
        .getDayDataForMonth({
          day: 1,
          month: this.monthSignal(),
          year: this.yearSignal(),
        })
        .pipe(take(1))
        .subscribe((x) => {
          if (x != null) {
            console.log(
              'Day Data of month fetched',
              this.monthSignal(),
              this.yearSignal()
            );

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
