import { createReducer, on } from '@ngrx/store';
import { incrementMonth, decrementMonth, reset, setDay } from './months.actions';
import { DayWeeksMonthYear } from 'src/app/shared/models/day-weeks-month-year.model';

export const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * To go to the next month or previous month
 * @param currentMonth has the current month and year info along with the number of days in that month, year.
 * @param action +1 to increment month and -1 to decrement month
 * @returns the month, year and the number of days in that month, year.
 */
export function changeMonth(
  currentMonth: DayWeeksMonthYear,
  action: number
): DayWeeksMonthYear {
  var m = months.indexOf(currentMonth.Month);
  var y = currentMonth.Year;

  if (action == 1) {
    // Go to the next month
    if (m == 11) {
      //If month is December, go to next year
      m = 0;
      y++;
    } else {
      m++;
    }
  } else {
    // Go to the previous month
    if (m == 0) {
      //If month is January, go to prev year
      m = 11;
      y--;
    } else {
      m--;
    }
  }

  return {
    Day:1,
    Weeks: findNoOfWeeks(months[m], y),
    Month: months[m],
    Year: y,
  };
}

/**
 * Find the number of days in a month, year
 * @param month in string. eg: 'September'
 * @param year in number. eg: 2023
 * @returns the number of days in that month and year
 */
export function findNoOfDays(month: string, year: number): number {
  switch (month) {
    case 'September':
    case 'April':
    case 'June':
    case 'November':
      return 30;
    case 'February':
      if (year % 4 == 0) {
        return 29;
      } else {
        return 28;
      }
  }
  return 31;
}

/**
 * Find the weeks in a month
 * @param m in string. eg: 'November'
 * @param y in number. eg: 2023
 * @returns Multidimensional array with each array having the days in that week
 */
export function findNoOfWeeks(m: string, y: number): number[][] {
  const result: number[][] = [];
  const daysInTheMonth = findNoOfDays(m,y);
  let temp: number[] = [];
  let day = new Date(y,months.indexOf(m),1).getDay(); //Gets the day of the first day of the month [0-6]
  for(let i=1;i<=daysInTheMonth;i++){
    if(day == 0){ //Sunday
      temp = []; //Clear array
    }
    temp.push(i);
    if(day == 6 || i == daysInTheMonth){ //Saturday or last day of the month
      result.push(temp); //Add week to main array
      day = -1; //Reset day for next week
    }
    day++;
  }
  return result;
}

function setDayMonthYear(state: DayWeeksMonthYear, day: number): DayWeeksMonthYear {
  return {
    Day: day,
    Month: state.Month,
    Weeks: state.Weeks,
    Year: state.Year
  }
}

export const initialState = (): DayWeeksMonthYear => {
  const d = new Date();
  const m = months[d.getMonth()];
  const y = d.getFullYear();
  return {
    Day: 1,
    Weeks: findNoOfWeeks(m, y),
    Month: m,
    Year: y,
  };
};

export const monthsReducer = createReducer(
  initialState(),
  on(incrementMonth, (state) => changeMonth(state, 1)),
  on(setDay, (state, prop) => setDayMonthYear(state, prop.day)),
  on(decrementMonth, (state) => changeMonth(state, -1)),
  on(reset, (state) => (state = initialState()))
);

