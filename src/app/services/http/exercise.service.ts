import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Exercise } from 'src/app/shared/models/exercise.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private api = inject(ApiService);

  public getAllExercises(): Observable<Exercise[]> {
    const JwtToken = localStorage.getItem("JwtToken");
    return this.api.getRequest<Exercise[], Exercise[]>(
      "exercise/all",
      'json',
      [{ name: 'Authorization', value: `Bearer ${JwtToken}` }],
      (value) => {
        if (value != null) {
          return value;
        }
        return [];
      });
  }

  public getExercise(exId: number): Observable<Exercise> {
    const JwtToken = localStorage.getItem("JwtToken");
    return this.api.getRequest<Exercise, Exercise>(
      `exercise/${exId}`,
      'json',
      [{ name: 'Authorization', value: `Bearer ${JwtToken}` }],
      (value) => { return value; }
    )
  }

  public addExercise(exercise: Exercise): Observable<number> {
    const JwtToken = localStorage.getItem('JwtToken');
    return this.api.postRequest<number, number>(
      'exercise/new',
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

  public editExercise(exercise: Exercise): Observable<number> {
    const JwtToken = localStorage.getItem('JwtToken');
    return this.api.putRequest<number, number>(
      'exercise/'+exercise.exId,
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
