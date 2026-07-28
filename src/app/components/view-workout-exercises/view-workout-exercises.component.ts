import { Component, input, Input } from '@angular/core';
import { ImportedExercise } from 'src/app/shared/models/imported-exercise.model';

@Component({
    selector: 'app-view-workout-exercises',
    templateUrl: './view-workout-exercises.component.html',
    styleUrls: ['./view-workout-exercises.component.sass'],
    standalone: false
})
export class ViewWorkoutExercisesComponent {
  exercise = input.required<ImportedExercise>();
}
