import {
  Component,
  OnInit,
  Signal,
  WritableSignal,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { SelectionsStore } from 'src/app/services/ctrl/selections.store';
import { MonthStore } from 'src/app/services/ctrl/months.store';
import { DayService } from 'src/app/services/http/day.service';
import { DateData } from 'src/app/shared/models/date-data.model';
import { DayData } from 'src/app/shared/models/day-data.model';
import { Mode } from 'src/app/shared/models/mode.model';

@Component({
    selector: 'app-view-day',
    templateUrl: './view-day.component.html',
    styleUrls: ['./view-day.component.sass'],
    standalone: false
})
export class ViewDayComponent implements OnInit {
  private router = inject(Router);
  private snackbar = inject(MatSnackBar);
  private dayService = inject(DayService);
  exStore = inject(SelectionsStore);
  store = inject(MonthStore);

  daySignal: Signal<number> = computed(() => this.store.Day());
  monthSignal: Signal<string> = computed(() => this.store.Month());
  yearSignal: Signal<number> = computed(() => this.store.Year());
  dateDataSignal: Signal<DateData> = computed(() => {
    return {
      day: this.daySignal(),
      month: this.monthSignal(),
      year: this.yearSignal(),
    };
  });

  mode: WritableSignal<Mode> = signal(Mode.VIEW);
  dayViewMode = Mode;

  dayData: WritableSignal<DayData | undefined> = signal(undefined);
  editDayData: WritableSignal<DayData | undefined> = signal(undefined);
  currentDay: WritableSignal<DateData | undefined> = signal(undefined);

  ngOnInit(): void {
    this.refreshDayData();
  }

  addWorkoutBtnDisabled(): boolean {
    if (this.dayData != undefined) return true;
    if (this.mode() == Mode.ADD || this.mode() == Mode.EDIT) return true;
    return true;
  }

  addDayData() {
    this.currentDay.set(this.dateDataSignal());
    this.mode.set(Mode.ADD);
    this.editDayData.set(undefined);
    this.exStore.resetSelection();
  }
  editDay() {
    this.currentDay.set(this.dateDataSignal());
    this.mode.set(Mode.EDIT);
    this.editDayData.set(this.dayData());
    this.exStore.resetSelection();
  }

  removeDay() {
    if (
      confirm('Do you want to remove this day data?\nThis cannot be undone')
    ) {
      const dd = this.dayData();
      if (dd) {
        this.dayService
          .removeDayData(dd.ddId)
          .pipe(take(1))
          .subscribe((x) => {
            if (x == 1) {
              this.refreshDayData();
              this.snackbar.open(
                'Day data has been deleted successfully',
                'Dismiss',
                {
                  duration: 5000,
                },
              );
              this.goToViewMode();
            } else if (x == 0) {
              this.snackbar.open('Unable to find Day data', 'Got it', {
                duration: 5000,
              });
            }
          });
      }
    }
  }

  addWorkout() {
    // TODO: Add a workout schedule for the day
  }

  close_nav() {
    this.store.resetDayValue();
    this.router.navigateByUrl('/main');
  }

  addOrEditDay(value: { data: DayData | undefined; submit: boolean }) {
    if (value.submit && value.data) {
      if (this.mode() == Mode.ADD) {
        this.dayService
          .addDayData(value.data)
          .pipe(take(1))
          .subscribe((x) => {
            if (x == 1) {
              this.refreshDayData();
              this.snackbar.open('Day data added successfully', 'Dismiss', {
                duration: 5000,
              });
              this.goToViewMode();
            } else if (x == -1) {
              this.snackbar.open('Unable to add Day data', 'Got it', {
                duration: 5000,
              });
            } else {
              this.snackbar.open(
                'Sorry! Day data already exists for this day',
                'Got it',
                {
                  duration: 5000,
                },
              );
              this.goToViewMode();
            }
          });
      } else if (this.mode() == Mode.EDIT) {
        this.dayService
          .editDayData(value.data)
          .pipe(take(1))
          .subscribe((x) => {
            if (x == 1) {
              this.refreshDayData();
              this.snackbar.open(
                'Day data has been editted successfully',
                'Dismiss',
                {
                  duration: 5000,
                },
              );
              this.goToViewMode();
            } else if (x == -1) {
              this.snackbar.open('Unable to edit Day data', 'Got it', {
                duration: 5000,
              });
            }
          });
      }
    } else {
      this.goToViewMode();
    }
  }

  refreshDayData() {
    this.dayService
      .getDayData(this.dateDataSignal())
      .pipe(take(1))
      .subscribe((value) => {
        if (value != null) {
          this.dayData.set(value);
        } else {
          this.dayData.set(undefined);
        }
      });
  }

  onFormSubmit(result: { data: DayData | undefined; submit: boolean }) {
    // TODO: On day data form submit. Do any actions if necessary
    console.log(result);
    this.addOrEditDay({ data: result.data, submit: result.submit });
  }

  goToViewMode() {
    this.mode.set(Mode.VIEW);
    this.editDayData.set(undefined);
    this.exStore.resetSelection();
  }
}
