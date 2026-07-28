import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { Workout } from 'src/app/shared/models/workout.model';

@Component({
  selector: 'app-view-workout',
  templateUrl: './view-workout.component.html',
  styleUrls: ['./view-workout.component.sass'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ViewWorkoutComponent {
  workout = input.required<Workout>();
  workNo = input.required<number>();
}
