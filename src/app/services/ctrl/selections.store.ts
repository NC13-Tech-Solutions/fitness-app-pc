import { ExerciseSelected } from 'app/shared/models/exercise-selected.model';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { computed } from '@angular/core';
import {
  FormDataStatus,
  IEFormDataStatus,
} from 'app/shared/models/form-data-status';
import { FormStatus } from 'app/shared/models/form-status.model';
import {
  selectExercise,
  changeExercise,
  removeExercise,
} from './selections-state-exercise-selections.actions';
import { Workout } from 'app/shared/models/workout.model';
import {
  addToDeleteQueue,
  clearQueue,
  removeItemsFromQueue,
} from './selections-state-itbd.actions';
import { changeMainFS } from './selections-state-form-status.actions';
import { ItemsToBeDeletedData } from 'app/shared/models/items-to-be-deleted-data.model';

type SelectionsState = {
  exerciseSelections: ExerciseSelected[];
  formStatus: FormDataStatus;
  itemsToBeDeleted: ItemsToBeDeletedData[];
};

/**
 * Default `ExerciseSelectionsState` state, where `exerciseSelections` and `itemsToBeDeleted` are empty, and default `formStatus` is applied.
 * @returns The initial state of selections.
 */
export const initialSelectionsState = (): SelectionsState => {
  return {
    exerciseSelections: [],
    formStatus: {
      status: FormStatus.OKAY, // Default status of the form
      workouts: [
        {
          status: FormStatus.OKAY, // Default status of a workout
          exercises: [], // No exercises initially
        },
      ],
    },
    itemsToBeDeleted: [], // No items marked for deletion initially
  };
};

/**
 * Generates the initial state for editing a day, based on the provided workouts.
 * @param workouts - List of workouts to initialize the state.
 * @returns The initial state for editing a day.
 */
export function initialSelectionsStateForEditDay(
  workouts: Workout[],
): SelectionsState {
  let formStatus: FormDataStatus = {
    status: FormStatus.OKAY, // Default status of the form
    workouts: [],
  };
  let wIndex = 0;
  let exSelections: ExerciseSelected[] = []; // List of selected exercises

  for (let x of workouts) {
    formStatus.workouts.push({
      status: FormStatus.OKAY, // Default status of a workout
      exercises: [],
    });
    let ieArray: IEFormDataStatus[] = []; // Array to hold exercise statuses

    if (x.exercises.length > 0) {
      for (let ie of x.exercises) {
        exSelections = selectExercise(exSelections, '', ie.slNo); // Select exercise
        ieArray.push({ slNo: ie.slNo, status: FormStatus.OKAY }); // Add exercise status
      }
      formStatus.workouts[wIndex].exercises = ieArray; // Assign exercise statuses to the workout
      wIndex++;
    }
  }

  return {
    exerciseSelections: exSelections,
    formStatus,
    itemsToBeDeleted: [], // No items marked for deletion initially
  };
}

/**
 * Store for managing selections state, including methods for updating and resetting the state.
 */
export const SelectionsStore = signalStore(
  { providedIn: 'root' },
  withState(initialSelectionsState()),
  withMethods((store) => ({
    // Start of EXERCISE SELECTIONS Actions
    /**
     * Sets a new exercise selection.
     * @param exerciseSlNo Serial number of the exercise.
     * @param exerciseName Name of the exercise.
     */
    setExerciseSelection(exerciseSlNo: number, exerciseName: string) {
      patchState(store, (state) => ({
        exerciseSelections: selectExercise(
          state.exerciseSelections,
          exerciseName,
          exerciseSlNo,
        ),
      }));
    },

    /**
     * Changes an existing exercise selection.
     * @param exerciseSlNo Serial number of the exercise.
     * @param exerciseName Name of the exercise.
     */
    changeExerciseSelection(exerciseSlNo: number, exerciseName: string) {
      patchState(store, (state) => ({
        exerciseSelections: changeExercise(
          state.exerciseSelections,
          exerciseName,
          exerciseSlNo,
        ),
      }));
    },

    /**
     * Removes an exercise selection.
     * @param exerciseSlNo Serial number of the exercise to remove.
     */
    removeExerciseSelection(exerciseSlNo: number) {
      patchState(store, (state) => ({
        exerciseSelections: removeExercise(
          state.exerciseSelections,
          exerciseSlNo,
        ),
      }));
    },
    // End of EXERCISE SELECTIONS Actions
    // Start of ITEMS TO BE DELETED Actions

    /**
     * Adds an item to the deletion queue.
     * @param fileName name of the item to add to the deletion queue.
     * @param type either `images` or `videos`
     */
    addItemToDeletionQueue(fileName: string, type: 'images' | 'videos') {
      patchState(store, (state) => ({
        itemsToBeDeleted: addToDeleteQueue(state.itemsToBeDeleted, {
          fileName,
          type,
        }),
      }));
    },

    /**
     * Removes items from the deletion queue.
     * @param items List of items to remove from the deletion queue.
     */
    removeItemsFromDeletionQueue(items: ItemsToBeDeletedData[]) {
      patchState(store, (state) => ({
        itemsToBeDeleted: removeItemsFromQueue(state.itemsToBeDeleted, items),
      }));
    },

    /**
     * Deletes items from the deletion queue using a provided deletion function.
     * @param deletionFunction Function to delete an item by URL.
     */
    deleteItemsFromDeletionQueue(
      deletionFunction: (data: ItemsToBeDeletedData | null) => Promise<number>,
    ) {
      patchState(store, (state) => ({
        itemsToBeDeleted: clearQueue(state.itemsToBeDeleted, deletionFunction),
      }));
    },
    // End of ITEMS TO BE DELETED Actions
    // Start of FORM STATUS Actions

    /**
     * Updates the main form status in the state.
     * @param status The new status to set for the main form.
     */
    changeMainFormStatus(status: FormStatus) {
      patchState(store, (state) => ({
        formStatus: changeMainFS(state.formStatus, status),
      }));
    },
    // End of FORM STATUS Actions

    /**
     * Resets the selections state to its initial state.
     * This clears all exercise selections, resets the form status, and clears the deletion queue.
     */
    resetSelection() {
      patchState(store, (state) => (state = initialSelectionsState()));
    },
  })),

  withComputed(({formStatus,itemsToBeDeleted}) => ({
    mainFormStatus: computed(() => formStatus().status),
    hasNoItemsToBeCleared: computed(() => {
      if (itemsToBeDeleted().length === 0) {
        return true;
      } else {
        return false;
      }
    }),
  })),
);
