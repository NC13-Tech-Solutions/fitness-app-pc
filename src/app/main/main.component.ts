import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { decrementMonth, incrementMonth, reset } from '../services/ctrl/months.actions';
import { DaysMonthYear } from '../shared/models/days-month-year.model';
import { Observable, map, take } from 'rxjs';
import { UserService } from '../services/http/user.service';
import { MatDrawer } from '@angular/material/sidenav';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainComponent {
  daysArray: Array<number> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];
  router = inject(Router);
  store = inject(Store<{ dmy: DaysMonthYear }>);
  userService = inject(UserService);

  dmy:Observable<DaysMonthYear> = this.store.select('months');
  monthText:Observable<string> = this.dmy.pipe(map(snaps => { return snaps.Month }));
  daysValue:Observable<number> = this.dmy.pipe(map(snaps => { return snaps.Days }));
  yearValue:Observable<number> = this.dmy.pipe(map(snaps => { return snaps.Year }));

  logOut(){
    this.userService.logOut().pipe(take(1)).subscribe((value) => {
      if(value){
        this.router.navigateByUrl('/login');
      }
    })
  }

  showExercises(){
    this.router.navigateByUrl('/exercises')
  }

  showWorkouts(){

  }

  close_exercises_nav(elemRef: MatDrawer){
    elemRef.close();
  }

  goToPrevMonth(){
    this.store.dispatch(decrementMonth());
  }

  goToNextMonth() {
    this.store.dispatch(incrementMonth());
  }

  goToCurrentMonth() {
    this.store.dispatch(reset());
  }

  arrayOfNumbers(i: number): Array<number>{
    // Resetting the array
    while(this.daysArray.length > 28){
      this.daysArray.pop();
    }

    // Adding new values, if necessary
    let x = 29;
    while(this.daysArray.length < i){
      this.daysArray.push(x);
      x++;
    }
    return this.daysArray;
  }

  howManyWorkoutsThatDay(day: number): number{
    // TODO: need to extract day info here. remove code once done
    return day%2 == 0 ? 1:0;
  }

}
