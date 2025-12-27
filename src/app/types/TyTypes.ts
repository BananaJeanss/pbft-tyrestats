import { AIStrategySettingsS } from "../(main)/dashboard/components/AIStrategySettings";
import { IconName } from "../components/lucide-selector";

export interface TySession {
  id: string;
  folder: string | null;
  meta: {
    name: string;
    date: string;
    lastModified: string;
    selectedIcon: string;
    icon_url?: string;
  };
  raceConfig: {
    RaceLaps: number;
  };
  tyrePreferences: {
    preferredSwitchoverPoint: number;
    softToMediumRatio: number;
    mediumToHardRatio: number;
  };
  tyreData: Record<string, TyreWearData>;
  currentNotes?: string;
  currentSuggestion?: string;
  manualStints: ManualStint[];
  aiConfigSettings: AIStrategySettingsS;
}

export interface TyreWearData {
  remainingLife: number;
  lapsDriven: number;
  wearPerLap: number;
}

export interface ManualStint {
  id: string;
  tyre: "soft" | "medium" | "hard" | "wet";
  laps: number;
}

export interface RaceConfiguration {
  RaceLaps: number;
}

export interface TyrePreferences {
  preferredSwitchoverPoint: number;
  softToMediumRatio: number;
  mediumToHardRatio: number;
}

export interface TimelineData {
  name: string;
  [stintKey: string]: string | number;
}

export interface Stint {
  key: string;
  tyreId: string;
  laps: number;
  color: string;
  label: string;
}

export interface TyreData {
  soft?: TyreWearData;
  medium?: TyreWearData;
  hard?: TyreWearData;
  wet?: TyreWearData;
}

export interface Folder {
  id: string;
  name: string;
  icon: IconName;
  color: string;
}
