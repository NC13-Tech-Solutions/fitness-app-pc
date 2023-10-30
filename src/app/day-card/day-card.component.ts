import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-day-card',
  templateUrl: './day-card.component.html',
  styleUrls: ['./day-card.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DayCardComponent {
  @Input() dayValue = 1;
  @Input() workoutsDoneToday = 0;
}
