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

export const FolderSchema = z.object({
  id: z.string().max(64),

  name: z.string().min(1).max(50),

  icon: z.string().max(50),

  color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid color hex code"),
});

// 2. Define the main TySession Schema

export const TySessionSchema = z.object({
  id: z.string().max(64),

  folder: z.string().max(64).nullable(),

  meta: z.object({
    name: z.string().max(100),

    date: z.string().max(30), // ISO date string usually ~24 chars

    lastModified: z.string().max(30),

    selectedIcon: z.string().max(50),

    icon_url: z.string().url().max(500).optional().or(z.literal("")),
  }),

  raceConfig: z.object({
    RaceLaps: z.number().max(10000), // Sanity check
  }),

  tyrePreferences: z.object({
    preferredSwitchoverPoint: z.number(),

    softToMediumRatio: z.number(),

    mediumToHardRatio: z.number(),
  }),

  // Record<string, TyreWearData>

  tyreData: z.record(z.string().max(20), TyreWearDataSchema),

  currentNotes: z.string().max(10000).optional(), // Max 10k chars for notes

  currentSuggestion: z.string().max(15000).optional(),

  shortUrl: z.string().max(100).optional(),

  manualStints: z.array(ManualStintSchema).max(100), // Prevent 1000s of stints

  // REPLACE z.any() with actual schema for AIStrategySettingsS if possible

  aiConfigSettings: AIStrategySettingsSchema,

  weather: z.array(WeatherEntrySchema).max(50).optional(),

  miscStats: MiscStatsSchema.optional(),
});
