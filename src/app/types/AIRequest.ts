import { TyreWearData } from "./TyTypes";

export interface ExpectedRequest {
  tyreData: Record<string, TyreWearData>;
  raceConfig: {
    RaceLaps: number;
  };
  tyrePreferences: {
    preferredSwitchoverPoint: number;
    softToMediumRatio: number;
    mediumToHardRatio: number;
  };
  notes?: string;
  aiConfig: {
    model: string;
    temperature: number;
    top_p: number;
    useExperimentalPrompt: boolean;
  };
}
