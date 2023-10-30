import { createAction } from "@ngrx/store";

export const incrementMonth = createAction('Increase Month');
export const decrementMonth = createAction('Decrease Month');
export const reset = createAction('Reset to Default Month');
