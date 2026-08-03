import {
  Component,
  input,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ImportedExercise } from 'app/shared/models/imported-exercise.model';

@Component({
  selector: 'app-view-workout-exercises',
  templateUrl: './view-workout-exercises.component.html',
  styleUrls: ['./view-workout-exercises.component.sass'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ViewWorkoutExercisesComponent {
  exercise = input.required<ImportedExercise>();
}
