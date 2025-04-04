import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-day-card',
  templateUrl: './day-card.component.html',
  styleUrls: ['./day-card.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DayCardComponent{
  dayValue = input<number>(1);
  isToday = input<boolean>(false);
  workoutsDoneToday = input<number>(0);
  callback = output();

  dayClicked() {
    this.callback.emit();
  }
}
