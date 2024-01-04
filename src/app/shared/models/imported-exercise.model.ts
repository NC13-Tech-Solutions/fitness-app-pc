import { VideoData } from "./video-data.model";

export interface ImportedExercise {
  slNo: number;
  exId: number;
  weightsUsed: number[];
  dropSets: number;
  repRange: string;
  sets: number;
  restTime: string;
  superSetOf: number;
  exerciseExplainer: string;
  exerciseFormVideos: VideoData[];
}
