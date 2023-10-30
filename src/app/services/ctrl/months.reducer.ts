import { createReducer, on } from "@ngrx/store";
import { incrementMonth, decrementMonth, reset } from "./months.actions";
import { DaysMonthYear } from "src/app/shared/models/days-month-year.model";

const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

/**
 * To go to the next month or previous month
 * @param currentMonth has the current month and year info along with the number of days in that month, year.
 * @param action +1 to increment month and -1 to decrement month
 * @returns the month, year and the number of days in that month, year.
 */
export function changeMonth(currentMonth: DaysMonthYear, action:number): DaysMonthYear{
  var m = months.indexOf(currentMonth.Month);
  var y = currentMonth.Year;

  if(action == 1){ // Go to the next month
    if(m==11){ //If month is December, go to next year
      m = 0;
      y++;
    } else{
      m++;
    }
  } else { // Go to the previous month
    if(m == 0){ //If month is January, go to prev year
      m = 11;
      y--;
    } else {
      m--;
    }
  }

  return {
    Days: findNoOfDays(months[m], y),
    Month: months[m],
    Year: y
  };
}

/**
 * Find the number of days in a month, year
 * @param month in string. eg: 'September'
 * @param year in number. eg: 2023
 * @returns the number of days in that month and year
 */
export function findNoOfDays(month: string, year: number): number{
  switch(month){
    case 'September':
    case 'April':
    case 'June':
    case 'November': return 30;
    case 'February':
      if(year%4 == 0){
        return 29;
      } else {
        return 28;
      }
  }
  return 31;
}

export const initialState = ():DaysMonthYear => {
  const d = new Date();
  const m = months[d.getMonth()];
  const y = d.getFullYear();
  return {
    Days: findNoOfDays(m, y),
    Month : m,
    Year: y
  };
};

export const monthsReducer = createReducer(
initialState(),
on(incrementMonth, state => changeMonth(state,1)),
on(decrementMonth, state => changeMonth(state,-1)),
on(reset, state => state = initialState())
);
