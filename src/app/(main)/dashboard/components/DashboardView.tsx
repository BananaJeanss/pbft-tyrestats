"use client";

import { Pencil, Copy } from "lucide-react";
import {
  RaceConfiguration,
  TyrePreferences,
  TyreWearData,
  ManualStint,
  TimelineData,
  Stint,
} from "@/app/types/TyTypes";
import DashTimeline from "./DashTimeline";
import TyresView from "./TyresView";
import AIStrategySuggestion from "./AIStrategySuggestion";
import DashNotes from "./DashNotes";
import { AIStrategySettingsS } from "./AIStrategySettings";

interface DashboardViewProps {
  sessionName: string;
  readOnly?: boolean;

  // Data
  tyreData: Record<string, TyreWearData>;
  raceConfig: RaceConfiguration;
  tyrePreferences: TyrePreferences;
  manualStints: ManualStint[];
  currentNotes: string;
  currentSuggestion: string;
  aiConfigSettings: {
    model: string;
    temperature: number;
    top_p: number;
    useExperimentalPrompt: boolean;
  };

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
  setIsManualMode: (mode: boolean) => void;
  openDashShare?: () => void;

  // Share specific
  onCopySession?: () => void;
}

export default function DashboardView({
  sessionName,
  readOnly = false,
  tyreData,
  raceConfig,
  tyrePreferences,
  manualStints,
  currentNotes,
  currentSuggestion,
  aiConfigSettings,
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
  setIsManualMode,
  openDashShare,
  onCopySession,
}: DashboardViewProps) {
  return (
    <div className="w-full h-full bg-zinc-100 dark:bg-neutral-800 rounded-lg p-4 flex flex-col gap-2">
      <div className="flex flex-row justify-between items-center">
        <h2 className="font-semibold text-2xl flex flex-row gap-2 items-center">
          {sessionName}
          {!readOnly && onEditSessionSettings && (
            <button className="cursor-pointer" onClick={onEditSessionSettings}>
              <Pencil />
            </button>
          )}
          {readOnly && (
            <span className="text-sm font-normal text-neutral-500 px-2 py-0.5 bg-neutral-200 dark:bg-neutral-900 rounded-full">
              Read Only
            </span>
          )}
        </h2>
        {readOnly && onCopySession && (
          <button
            onClick={onCopySession}
            className="flex items-center gap-2 border border-(--tyrestats-blue) hover:bg-(--tyrestats-blue)/90 px-4 py-2 rounded-lg font-semibold cursor-pointer text-sm"
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
          isManualMode ? manualStints.length > 0 : timelineGenerated
        }
        timelineData={isManualMode ? manualTimelineData : autoTimelineData}
        timelineStints={
          isManualMode ? manualTimelineStintsDef : autoTimelineStints
        }
        tyreData={tyreData}
        setRaceSettingsVis={setRaceSettingsVis}
        raceConfig={raceConfig}
        isManualMode={isManualMode}
        setIsManualMode={setIsManualMode}
        openDashShare={openDashShare || (() => {})}
        readOnly={readOnly}
      />

      {/* top tiles section - tyres and ai */}
      <div className="w-full flex flex-col md:flex-row h-full md:h-2/5 gap-2 min-h-75">
        {/* tyressssssss */}
        <TyresView
          tyreData={tyreData}
          tyrePreferences={tyrePreferences}
          setTyrePreferences={setTyrePreferences}
          settyremanVis={settyremanVis}
          setSelectedTyre={setSelectedTyre}
          readOnly={readOnly}
        />

        {/* AI strategy overview */}
        <AIStrategySuggestion
          tyreData={tyreData}
          raceConfig={raceConfig}
          tyrePreferences={tyrePreferences}
          notes={currentNotes}
          existingSuggestion={currentSuggestion}
          onSave={setCurrentSuggestion}
          onSaveConfig={setAIConfigSettings}
          aiConfig={aiConfigSettings}
          readOnly={readOnly}
        />
      </div>

      {/* Notes section*/}
      <DashNotes
        notes={currentNotes}
        onChange={setCurrentNotes}
        readOnly={readOnly}
      />
    </div>
  );
}
