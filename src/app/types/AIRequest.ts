import { TyreWearData, TySession } from "./TyTypes";

export interface ExpectedRequest {
  tyreData: Record<string, TyreWearData>;
  raceConfig: TySession;
}
