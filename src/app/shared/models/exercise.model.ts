import { MiscDataType } from "./misc-data-type.model";

export interface Exercise {
  exId: number;
  name: string;
  description: string;
  miscDataType: MiscDataType;
  miscData: string;
  disabled: boolean;
}
