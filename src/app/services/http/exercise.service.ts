import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Exercise } from 'src/app/shared/models/exercise.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExerciseService {
  private api = inject(ApiService);
  private entryPoint = 'exercise';

  /**
   * Finds all exercises
   * @returns Observable of list of all {@link Exercise}
   */
  public getAllExercises(): Observable<Exercise[]> {
    const JwtToken = localStorage.getItem('JwtToken');
    return this.api.getRequest<Exercise[], Exercise[]>(
      `${this.entryPoint}/all`,
      'json',
      [{ name: 'Authorization', value: `Bearer ${JwtToken}` }],
      (value) => {
        if (value != null) {
          return value;
        }
        return [];
      }
    );
  }
  /**
   * Finds the exercise with {@link Exercise.exId}
   * @param exId
   * @returns Observable of {@link Exercise} or `null` if exercise doesn't exist
   */
  public getExercise(exId: number): Observable<Exercise> {
    const JwtToken = localStorage.getItem('JwtToken');
    return this.api.getRequest<Exercise, Exercise>(
      `${this.entryPoint}/${exId}`,
      'json',
      [{ name: 'Authorization', value: `Bearer ${JwtToken}` }],
      (value) => {
        return value;
      }
    );
  }

  /**
   * Adds a new exercise
   * @param exercise
   * @returns Observable of number which returns the following:
   * `1` - if insert is successful; `-1` - if not successful; `0` - if {@link Exercise.name} already exists
   */
  public addExercise(exercise: Exercise): Observable<number> {
    const JwtToken = localStorage.getItem('JwtToken');
    return this.api.postRequest<number, number>(
      `${this.entryPoint}/new`,
      'text',
      exercise,
      [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Authorization', value: `Bearer ${JwtToken}` },
      ],
      (value) => {
        return value;
      }
    );
  }

  /**
   * Edits the exercise data
   * @param exercise
   * @remarks {@link Exercise.exId} will be used to find the exercise
   * @returns Observable of number which returns the following:
   * `1` - if update is successful; `-1` - if exercise is not found; `0` - if {@link Exercise.name} already exists
   */
  public editExercise(exercise: Exercise): Observable<number> {
    const JwtToken = localStorage.getItem('JwtToken');
    return this.api.putRequest<number, number>(
      `${this.entryPoint}/${exercise.exId}`,
      'text',
      exercise,
      [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Authorization', value: `Bearer ${JwtToken}` },
      ],
      (value) => {
        return value;
      }
    );
  }
}
