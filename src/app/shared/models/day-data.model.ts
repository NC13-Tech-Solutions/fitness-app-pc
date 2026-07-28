import { DateData } from "./date-data.model";
import { Workout } from "./workout.model";
/**
 * Represents detailed information about a specific day, including metadata and activities.
 * @type {ddId: number, postedOn: {@link DateData}, postedBy: number, modifiedOn: {@link DateData}, modifiedBy: number, userWeight: number, workouts: {@link Workout}}
 */

export interface DayData {
  ddId: number;
  postedOn: DateData;
  postedBy: number;
  modifiedOn: DateData;
  modifiedBy: number;
  userWeight: number;
  workouts: Workout[];
}
