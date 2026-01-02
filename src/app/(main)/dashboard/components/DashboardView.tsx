"use client";

import { Pencil, Copy } from "lucide-react";
import {
  TyrePreferences,
  TimelineData,
  Stint,
  WeatherEntry,
  MiscStats,
  TySession,
} from "@/app/types/TyTypes";
import DashTimeline from "./DashTimeline";
import TyresView from "./TyresView";
import AIStrategySuggestion from "./AIStrategySuggestion";
import DashNotes from "./DashNotes";
import { AIStrategySettingsS } from "./AIStrategySettings";
import WeatherMisc from "./WeatherMisc";

interface DashboardViewProps {
  sessionName: string;
  readOnly?: boolean;

  // Data
  SessionData: TySession;

  // Timeline Data
  timelineGenerated: boolean;
  autoTimelineData: TimelineData[];
  autoTimelineStints: Stint[];
  manualTimelineData: TimelineData[];
  manualTimelineStintsDef: {
    tyreId: string;
    key: string;
    color: string;
    label: string;
  }[];
  isManualMode: boolean;

  // Actions
  onEditSessionSettings?: () => void;
  setRaceSettingsVis: (vis: boolean) => void;
  settyremanVis: (
    vis: boolean,
    tyreType?: "soft" | "medium" | "hard" | "wet",
  ) => void;
  setSelectedTyre: (tyre: string) => void;
  setTyrePreferences: (prefs: TyrePreferences) => void;
  setCurrentNotes: (notes: string) => void;
  setCurrentSuggestion: (suggestion: string) => void;
  setAIConfigSettings: (config: AIStrategySettingsS) => void;
  setWeather: (weather: WeatherEntry[]) => void;
  setMiscStats: (miscStats: MiscStats) => void;
  setIsManualMode: (mode: boolean) => void;
  openDashShare?: () => void;

  // Share specific
  onCopySession?: () => void;
  onClearTyreData: () => void;
}

export default function DashboardView({
  sessionName,
  readOnly = false,
  SessionData,
  timelineGenerated,
  autoTimelineData,
  autoTimelineStints,
  manualTimelineData,
  manualTimelineStintsDef,
  isManualMode,
  onEditSessionSettings,
  setRaceSettingsVis,
  settyremanVis,
  setSelectedTyre,
  setTyrePreferences,
  setCurrentNotes,
  setCurrentSuggestion,
  setAIConfigSettings,
  setWeather,
  setMiscStats,
  setIsManualMode,
  openDashShare,
  onCopySession,
  onClearTyreData,
}: DashboardViewProps) {
  return (
    <div className="flex h-full w-full flex-col gap-2 rounded-lg bg-zinc-100 p-4 dark:bg-neutral-800">
      <div className="flex flex-row items-center justify-between">
        <h2 className="flex flex-row items-center gap-2 text-2xl font-semibold">
          {sessionName}
          {!readOnly && onEditSessionSettings && (
            <button className="cursor-pointer" onClick={onEditSessionSettings}>
              <Pencil />
            </button>
          )}
          {readOnly && (
            <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-sm font-normal text-neutral-500 dark:bg-neutral-900">
              Read Only
            </span>
          )}
        </h2>
        {readOnly && onCopySession && (
          <button
            onClick={onCopySession}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-(--tyrestats-blue) px-4 py-2 text-sm font-semibold hover:bg-(--tyrestats-blue)/90"
          >
            <Copy size={16} />
            Copy Session & Edit
          </button>
        )}
      </div>
      <hr className="border-neutral-700" />

      {/* Timeline Section */}
      <DashTimeline
        timelineGenerated={
          isManualMode ? SessionData.manualStints.length > 0 : timelineGenerated
        }
        timelineData={isManualMode ? manualTimelineData : autoTimelineData}
        timelineStints={
          isManualMode ? manualTimelineStintsDef : autoTimelineStints
        }
        tyreData={SessionData.tyreData}
        setRaceSettingsVis={setRaceSettingsVis}
        raceConfig={SessionData.raceConfig}
        isManualMode={isManualMode}
        setIsManualMode={setIsManualMode}
        openDashShare={openDashShare || (() => {})}
        readOnly={readOnly}
      />

      {/* top tiles section - tyres and ai */}
      <div className="flex h-full min-h-60 w-full flex-col gap-2 md:h-3/5 md:flex-row">
        {/* tyressssssss */}
        <TyresView
          tyreData={SessionData.tyreData}
          tyrePreferences={SessionData.tyrePreferences}
          setTyrePreferences={setTyrePreferences}
          settyremanVis={settyremanVis}
          setSelectedTyre={setSelectedTyre}
          readOnly={readOnly}
          onClearTyreData={onClearTyreData}
        />

        {/* AI strategy overview */}
        <AIStrategySuggestion
          tyreData={SessionData.tyreData}
          raceConfig={SessionData}
          notes={SessionData.currentNotes}
          existingSuggestion={SessionData.currentSuggestion || ""}
          onSave={setCurrentSuggestion}
          onSaveConfig={setAIConfigSettings}
          readOnly={readOnly}
        />
      </div>

      {/* Notes section*/}
      <div className="flex grow flex-row gap-2">
        <DashNotes
          notes={SessionData.currentNotes}
          onChange={setCurrentNotes}
          readOnly={readOnly}
        />
        {/* Weather and Misc stats */}
        <WeatherMisc
          readOnly={readOnly}
          weather={SessionData.weather || []}
          setWeather={setWeather}
          miscStats={
            SessionData.miscStats || {
              avgLapTime: "",
              gridPosition: 0,
              totalGridDrivers: 0,
              raceStartTime: "",
              pitLossTime: 0,
            }
          }
          setMiscStats={setMiscStats}
        />
      </div>
    </div>
  );
}
