import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
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
function changeMonth(
  currentMonth: DayWeeksMonthYear,
  action: number
): DayWeeksMonthYear {
  const cur_date = initialState();
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

  if (months.indexOf(cur_date.Month) === m && cur_date.Year === y) {
    return cur_date;
  }

  return {
    Day: -1,
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
function findNoOfDays(month: string, year: number): number {
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
function findNoOfWeeks(m: string, y: number): number[][] {
  const result: number[][] = [];
  const daysInTheMonth = findNoOfDays(m, y);
  let temp: number[] = [];
  let day = new Date(y, months.indexOf(m), 1).getDay(); //Gets the day of the first day of the month [0-6]
  for (let i = 1; i <= daysInTheMonth; i++) {
    if (day == 0) {
      //Sunday
      temp = []; //Clear array
    }
    temp.push(i);
    if (day == 6 || i == daysInTheMonth) {
      //Saturday or last day of the month
      result.push(temp); //Add week to main array
      day = -1; //Reset day for next week
    }
    day++;
  }
  return result;
}

function setDayMonthYear(
  state: DayWeeksMonthYear,
  day: number
): DayWeeksMonthYear {
  return {
    Day: day,
    Month: state.Month,
    Weeks: state.Weeks,
    Year: state.Year,
  };
}

function resetBasedOnMonth(state: DayWeeksMonthYear): DayWeeksMonthYear {
  const cur_date = initialState();
  if (
    months.indexOf(state.Month) === months.indexOf(cur_date.Month) &&
    state.Year === cur_date.Year
  ) {
    return cur_date;
  }
  return setDayMonthYear(state, -1);
}

const initialState = (): DayWeeksMonthYear => {
  const d = new Date();
  const m = months[d.getMonth()];
  const y = d.getFullYear();
  return {
    Day: d.getDate(),
    Weeks: findNoOfWeeks(m, y),
    Month: m,
    Year: y,
  };
};

export const MonthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState()),
  withMethods((store) => ({
    incrementMonth() {
      patchState(store, (state) => (state = changeMonth(state, 1)));
    },
    setDay(day: number) {
      patchState(store, (state) => (state = setDayMonthYear(state, day)));
    },
    decrementMonth() {
      patchState(store, (state) => (state = changeMonth(state, -1)));
    },
    reset() {
      patchState(store, (state) => (state = initialState()));
    },
    resetDayValue() {
      patchState(store, (state) => (state = resetBasedOnMonth(state)));
    },
  }))
);
