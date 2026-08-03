import {
  FormDataStatus,
  IEFormDataStatus,
  WorkoutFormDataStatus,
} from 'app/shared/models/form-data-status';
import { FormStatus } from 'app/shared/models/form-status.model';

/**
 * Update the main form status
 * @param state current {@link FormDataStatus}
 * @param newStatus {@link FormStatus} to be changed
 * @returns new `FormDataStatus` after updating `state`
 */
export function changeMainFS(
  state: FormDataStatus,
  newStatus: FormStatus,
): FormDataStatus {
  return {
    ...state,
    status: newStatus,
  };
}

/**
 * Add a new {@link WorkoutFormDataStatus} to the `state.workouts` array
 * @param state current {@link FormDataStatus}
 * @returns new `FormDataStatus` after updating `state`
 */
export function addWorkout(state: FormDataStatus): FormDataStatus {
  const newState = {
    ...state,
    workouts: [...state.workouts, { status: FormStatus.OKAY, exercises: [] }],
  };
  return newState;
}

/**
 * For a single workout form, identifiable with `workoutIndex`
 * @param state current {@link FormDataStatus}
 * @param workoutIndex index of workout in `state.workouts` array
 * @param newStatus {@link FormStatus} to be changed
 * @returns new `FormDataStatus` after updating `state`
 */
export function changeWorkoutFormStatus(
  state: FormDataStatus,
  workoutIndex: number,
  newStatus: FormStatus,
): FormDataStatus {
  // Checking if workoutIndex is in workouts
  if (state.workouts.length > workoutIndex) {
    // exists
    const newWorkouts: WorkoutFormDataStatus[] = state.workouts.map(
      (w, index) => {
        if (workoutIndex == index) {
          // Found the workout to be changed
          return { ...w, status: newStatus };
        }
        return w;
      },
    );

    return {
      ...state,
      workouts: newWorkouts,
    };
  }
  // Not found, so returning previous state
  return state;
}

/**
 * Updates all workout forms in the `state.workouts` array
 * @param state current {@link FormDataStatus}
 * @param newStatus {@link FormStatus} to be changed
 * @returns new `FormDataStatus` after updating `state`
 */
export function changeAllWorkoutFormsStatus(
  state: FormDataStatus,
  newStatus: FormStatus,
): FormDataStatus {
  const newWorkouts: WorkoutFormDataStatus[] = state.workouts.map((w) => ({
    ...w,
    status: newStatus,
  }));

  return {
    ...state,
    workouts: newWorkouts,
  };
}

/**
 * Add a new {@link IEFormDataStatus} to the `state`
 * @param state current {@link FormDataStatus}
 * @param workoutIndex index of workout in `state.workouts` array
 * @param slNo of imported exercise form in `state.workouts[workoutIndex].exercises` array
 * @returns new `FormDataStatus` after updating `state`
 */
export function addNewWorkoutIE(
  state: FormDataStatus,
  workoutIndex: number,
  slNo: number,
): FormDataStatus {
  // Checking if workoutIndex is in workouts
  if (state.workouts.length > workoutIndex) {
    // exists
    const newWorkouts: WorkoutFormDataStatus[] = state.workouts.map(
      (w, index) => {
        if (workoutIndex == index) {
          // Found the workout to be changed
          return { ...w, exercises: [...w.exercises,{ slNo, status: FormStatus.OKAY }] };
        }
        return w;
      },
    );

    return {
      ...state,
      workouts: newWorkouts,
    };
  }
  // Not found, so returning previous state
  return state;
}

/**
 * For a single imported exercise form in a workout form, identifiable with `slNo` and `workoutIndex` respectively.
 * Uses {@link findIEIndexWithSlNo} to find imported exercise form using `slNo`
 * @param state current {@link FormDataStatus}
 * @param workoutIndex index of workout in `state.workouts` array
 * @param slNo of imported exercise form in `state.workouts[workoutIndex].exercises` array
 * @param newStatus {@link FormStatus} to be changed
 * @returns new `FormDataStatus` after updating `state`
 */
export function changeWorkoutIEFormStatus(
  state: FormDataStatus,
  workoutIndex: number,
  slNo: number,
  newStatus: FormStatus,
): FormDataStatus {
  // Checking if workoutIndex is in workouts
  if (state.workouts.length > workoutIndex) {
    // exists
    const newWorkouts: WorkoutFormDataStatus[] = state.workouts.map(
      (w, index) => {
        if (workoutIndex === index) {
          // Found the workout to be changed
          const ieIndex = findIEIndexWithSlNo(state, workoutIndex, slNo);
          const newExercises: IEFormDataStatus[] = w.exercises.map(
            (ie, indexOfIE) => {
              if (ieIndex && ieIndex == indexOfIE) {
                // Found the imported exercise to change
                return { ...ie, status: newStatus };
              }
              return ie;
            },
          );
          return { ...w, exercises: newExercises };
        }
        return w;
      },
    );

    return {
      ...state,
      workouts: newWorkouts,
    };
  }
  // Not found, so returning previous state
  return state;
}

/**
 * Checks if slNo is in `state.workouts[workoutIndex].exercises` array and returns the index of the form it is in.
 * @param state current {@link FormDataStatus}
 * @param workoutIndex index of workout in `state.workouts` array
 * @param slNo of imported exercise form in `state.workouts[workoutIndex].exercises` array
 * @returns index of the imported exercise form which has the `slNo` in `state.workouts[workoutIndex].exercises` array or `undefined` if not found.
 */
export function findIEIndexWithSlNo(
  state: FormDataStatus,
  workoutIndex: number,
  slNo: number,
): number | undefined {
  let result = -1;
  if (
    state.workouts[workoutIndex].exercises.some((value, index) => {
      if (value.slNo == slNo) {
        result = index;
        return true;
      }
      return false;
    })
  ) {
    return result;
  }
  return undefined;
}

/**
 * For all imported exercise forms in a workout form, identifiable with `workoutIndex`.
 * @param state current {@link FormDataStatus}
 * @param workoutIndex index of workout in `state.workouts` array
 * @param newStatus {@link FormStatus} to be changed
 * @returns new `FormDataStatus` after updating `state`
 */
export function changeAllWorkoutIEFormsStatus(
  state: FormDataStatus,
  workoutIndex: number,
  newStatus: FormStatus,
): FormDataStatus {
  // Checking if workoutIndex is in workouts
  if (state.workouts.length > workoutIndex) {
    // exists
    const newWorkouts: WorkoutFormDataStatus[] = state.workouts.map(
      (w, index) => {
        if (workoutIndex === index) {
          // Found the workout to be changed
          const newExercises: IEFormDataStatus[] = w.exercises.map((ie) => ({
            ...ie,
            status: newStatus,
          }));
          return { ...w, exercises: newExercises };
        }
        return w;
      },
    );

    return {
      ...state,
      workouts: newWorkouts,
    };
  }
  // Not found, so returning previous state
  return state;
}
