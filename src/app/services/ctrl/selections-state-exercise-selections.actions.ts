import { ExerciseSelected } from "app/shared/models/exercise-selected.model";

export function selectExercise(
  state: ExerciseSelected[],
  name: string,
  slNo: number,
): ExerciseSelected[] {
  for (let ex of state) {
    if (ex.exerciseSlNo == slNo) {
      // Since selection is already available, we don't need to change the state
      return state;
    }
  }

  // Changing state as selection is changed
  return [
    ...state,
    {
      exerciseName: name,
      exerciseSlNo: slNo,
    },
  ];
}

export function removeExercise(
  state: ExerciseSelected[],
  slNo: number
): ExerciseSelected[] {
  let newState: ExerciseSelected[] = [];
  for (let i = 0; i < state.length; i++) {
    if (state[i].exerciseSlNo == slNo) {
      // if slNo is found then skipping it for newState
      continue;
    }
    newState.push(state[i]);
  }

  return newState;
}

export function changeExercise(
  state: ExerciseSelected[],
  name: string,
  slNo: number
): ExerciseSelected[] {
  let newState: ExerciseSelected[] = [];
  for (let i = 0; i < state.length; i++) {
    if (state[i].exerciseSlNo == slNo) {
      // if slNo is found, then adding the new name for exercise
      newState.push({ exerciseName: name, exerciseSlNo: slNo });
      continue;
    }
    newState.push(state[i]);
  }

  return newState;
}
