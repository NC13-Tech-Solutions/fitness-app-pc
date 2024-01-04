import { createAction, props } from '@ngrx/store';

export const setExerciseSelection = createAction(
  'Exercise Selected',
  props<{
    exerciseSlNo: number;
    exerciseName: string;
  }>()
);

export const changeExerciseSelection = createAction(
  'Exercise Selection Changed',
  props<{
    exerciseSlNo: number;
    exerciseName: string;
  }>()
);

export const removeExerciseSelection = createAction(
  'Exercise Selection Removed',
  props<{
    exerciseSlNo: number;
  }>()
);

export const resetSelection = createAction('Reset to Default State');
