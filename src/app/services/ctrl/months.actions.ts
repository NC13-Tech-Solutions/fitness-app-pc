import { createAction, props } from '@ngrx/store';

export const incrementMonth = createAction('Increase Month');
export const setDay = createAction('Set Day, Month, Year', props<{day:number}>());
export const decrementMonth = createAction('Decrease Month');
export const reset = createAction('Reset to Default Month');
