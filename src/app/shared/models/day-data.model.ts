import { Workout } from "./workout.model";

export interface DayData {
  ddId: number;
  postedOn: string;
  postedBy: number;
  modifiedOn: string;
  modifiedBy: number;
  userWeight: number;
  workouts: Workout[];
}
