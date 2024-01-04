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

  state.push({
    exerciseName: name,
    exerciseSlNo: slNo,
  });

  return state;
}

function removeExercise(
  state: ExerciseSelected[],
  slNo: number
): ExerciseSelected[] {
  for (let i = 0; i < state.length; i++) {
    if (state[i].exerciseSlNo == slNo) {
      state.splice(i, 1);
      break;
    }
  }

  return state;
}

function changeExercise(
  state: ExerciseSelected[],
  name: string,
  slNo: number
): ExerciseSelected[] {
  for (let i = 0; i < state.length; i++) {
    if (state[i].exerciseSlNo == slNo) {
      state[i].exerciseName = name
      break;
    }
  }

  return state;
}

export const initialState = (): ExerciseSelected[] => {
  return [];
};

export const exerciseSelectionsReducer = createReducer(
  initialState(),
  on(setExerciseSelection, (state, prop) =>
    selectExercise(state, prop.exerciseName, prop.exerciseSlNo)
  ),
  on(changeExerciseSelection, (state, prop) =>
    changeExercise(state, prop.exerciseName, prop.exerciseSlNo)
  ),
  on(removeExerciseSelection, (state, prop) =>
    removeExercise(state, prop.exerciseSlNo)
  ),
  on(resetSelection, (state) => state = initialState())
);
