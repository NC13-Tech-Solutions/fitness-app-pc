import { Component, input } from '@angular/core';
import { Workout } from 'src/app/shared/models/workout.model';

@Component({
  selector: 'app-view-workout',
  templateUrl: './view-workout.component.html',
  styleUrls: ['./view-workout.component.sass']
})
export class ViewWorkoutComponent {
  workout = input.required<Workout>();

}
