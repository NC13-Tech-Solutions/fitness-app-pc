import { DateData } from "./date-data.model";
import { Workout } from "./workout.model";

export interface DayData {
  ddId: number;
  postedOn: DateData;
  postedBy: number;
  modifiedOn: DateData;
  modifiedBy: number;
  userWeight: number;
  workouts: Workout[];
}
