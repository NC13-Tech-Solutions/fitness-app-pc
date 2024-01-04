import { MiscDataType } from "./misc-data-type.model";

export interface VideoData {
  data: string;
  type: MiscDataType.VIDEO | MiscDataType.EMBEDDED;
}
