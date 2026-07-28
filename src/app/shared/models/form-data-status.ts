import { FormStatus } from './form-status.model';

/**
 * Represents the status of form data and its associated workouts.
 * @type {status: {@link FormStatus}, workouts: {@link WorkoutFormDataStatus}[]}
 */
export interface FormDataStatus {
  status: FormStatus;
  workouts: WorkoutFormDataStatus[];
}

/**
 * Represents the status of a single workout and its associated exercises.
 * @type {status: {@link FormStatus}, exercises: {@link IEFormDataStatus}[]}
 */
export interface WorkoutFormDataStatus {
  status: FormStatus;
  exercises: IEFormDataStatus[];
}

/**
 * Represents the status of an individual exercise in a workout.
 * @type {slNo: number, status: {@link FormStatus}}
 */
export interface IEFormDataStatus {
  slNo: number;
  status: FormStatus;
}
