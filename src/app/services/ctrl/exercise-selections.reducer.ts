import { createReducer, on } from '@ngrx/store';
import {
  changeExerciseSelection,
  removeExerciseSelection,
  resetSelection,
  setExerciseSelection,
} from './exercise-selections.actions';
import { ExerciseSelected } from 'src/app/shared/models/exercise-selected.model';

function selectExercise(
  state: ExerciseSelected[],
  name: string,
  slNo: number
): ExerciseSelected[] {
  for (let ex of state) {
    if (ex.exerciseSlNo == slNo) {
      return state;
    }
  }

  return [
    ...state,
    {
      exerciseName: name,
      exerciseSlNo: slNo,
    },
  ];
}

function removeExercise(
  state: ExerciseSelected[],
  slNo: number
): ExerciseSelected[] {
  let newState: ExerciseSelected[] = [];
  for (let i = 0; i < state.length; i++) {
    if (state[i].exerciseSlNo == slNo) {
      continue;
    }
    newState.push(state[i]);
  }

  return newState;
}

function changeExercise(
  state: ExerciseSelected[],
  name: string,
  slNo: number
): ExerciseSelected[] {
  let newState: ExerciseSelected[] = [];
  for (let i = 0; i < state.length; i++) {
    if (state[i].exerciseSlNo == slNo) {
      newState.push({ exerciseName: name, exerciseSlNo: slNo });
      continue;
    }
    newState.push(state[i]);
  }

  return newState;
}

export const initialExerciseSelectionState = (): ExerciseSelected[] => {
  return [];
};

export const exerciseSelectionsReducer = createReducer(
  initialExerciseSelectionState(),
  on(setExerciseSelection, (state, prop) =>
    selectExercise(state, prop.exerciseName, prop.exerciseSlNo)
  ),
  on(changeExerciseSelection, (state, prop) =>
    changeExercise(state, prop.exerciseName, prop.exerciseSlNo)
  ),
  on(removeExerciseSelection, (state, prop) =>
    removeExercise(state, prop.exerciseSlNo)
  ),
  on(resetSelection, (state) => (state = initialExerciseSelectionState()))
);
