import { ImportedExercise } from "./imported-exercise.model";
import { VideoData } from "./video-data.model";

export interface Workout {
  time: string;
  exercises: ImportedExercise[];
  text: string;
  photos: string[];
  videos: VideoData[];
}
