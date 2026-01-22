import { z } from "zod";

// 1. Define sub-schemas for nested objects
const TyreWearDataSchema = z.object({
  remainingLife: z.number(),
  lapsDriven: z.number(),
  wearPerLap: z.number(),
});

const ManualStintSchema = z.object({
  id: z.string(),
  tyre: z.enum(["soft", "medium", "hard", "wet"]),
  laps: z.number(),
});

const WeatherEntrySchema = z.object({
  time: z.string(),
  condition: z.string(),
  icon: z.string(),
});

const MiscStatsSchema = z.object({
  avgLapTime: z.string(),
  gridPosition: z.number(),
  totalGridDrivers: z.number(),
  raceStartTime: z.string(),
  pitLossTime: z.number(),
});

const AIStrategySettingsSchema = z.object({
  model: z.string(),
  temperature: z.number(),
  top_p: z.number(),
  useExperimentalPrompt: z.boolean(),
});

// 2. Define the main TySession Schema
export const TySessionSchema = z.object({
  id: z.string(),
  folder: z.string().nullable(),
  meta: z.object({
    name: z.string(),
    date: z.string(),
    lastModified: z.string(),
    selectedIcon: z.string(),
    icon_url: z.string().optional(),
  }),
  raceConfig: z.object({
    RaceLaps: z.number(),
  }),
  tyrePreferences: z.object({
    preferredSwitchoverPoint: z.number(),
    softToMediumRatio: z.number(),
    mediumToHardRatio: z.number(),
  }),
  // Record<string, TyreWearData>
  tyreData: z.record(z.string(), TyreWearDataSchema), 
  currentNotes: z.string().optional(),
  currentSuggestion: z.string().optional(),
  shortUrl: z.string().optional(),
  manualStints: z.array(ManualStintSchema),
  
  // REPLACE z.any() with actual schema for AIStrategySettingsS if possible
  aiConfigSettings: AIStrategySettingsSchema,
  
  weather: z.array(WeatherEntrySchema).optional(),
  miscStats: MiscStatsSchema.optional(),
});