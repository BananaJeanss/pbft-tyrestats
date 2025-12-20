"use client";

import { Pencil, Settings } from "lucide-react";
import TyreWearManager from "./components/TyreWearManager";
import { Stint, TimelineData, TyreWearData } from "@/app/types/TyTypes";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import TyreSettings, {
  TyrePreferences,
  DEFAULT_PREFERENCES,
} from "./components/TyreSettings";
import RaceSettings, {
  DEFAULT_RACECONFIGURATION,
} from "./components/RaceSettings";
import { RaceConfiguration } from "@/app/types/TyTypes";
import { ManualStint } from "@/app/types/TyTypes";
import DashSidebar from "./components/DashSidebar";
import AIStrategySuggestion from "./components/AIStrategySuggestion";
import DashNotes from "./components/DashNotes";
import { generateOptimalTimeline, getEffectiveTyreData } from "./TyreMath";
import DashTimeline from "./components/DashTimeline";
import SessionSettingsPage, {
  SessionSettings,
} from "./components/SessionSettings";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { toast } from "react-toastify";
import { TySession } from "@/app/types/TyTypes";
import { AIStrategySettingsS } from "./components/AIStrategySettings";

const TYRE_TYPES = [
  { id: "soft", label: "S", color: "text-red-600" },
  { id: "medium", label: "M", color: "text-yellow-500" },
  { id: "hard", label: "H", color: "text-white" },
  { id: "wet", label: "W", color: "text-blue-700" },
] as const;

export default function Dashboard() {
  const [tyremanVis, settyremanVis] = useState(false);
  const [tyresettingsVis, settyresettingsVis] = useState(false);
  const [selectedTyre, setSelectedTyre] = useState<
    "soft" | "medium" | "hard" | "wet" | null
  >(null);

  const [tyreData, setTyreData] = useState<Record<string, TyreWearData>>({});
  const [tyrePreferences, setTyrePreferences] =
    useState<TyrePreferences>(DEFAULT_PREFERENCES);

  // auto timeline states
  const [autoTimelineData, setAutoTimelineData] = useState<TimelineData[]>([]);
  const [autoTimelineStints, setAutoTimelineStints] = useState<Stint[]>([]);
  const [timelineGenerated, setTimelineGenerates] = useState(false);

  // manual timeline states
  const [manualStints, setManualStints] = useState<ManualStint[]>([]);
  const [isManualMode, setIsManualMode] = useState(false);

  const [raceSettingsVis, setRaceSettingsVis] = useState(false);
  const [raceConfig, setRaceConfig] = useState<RaceConfiguration>(
    DEFAULT_RACECONFIGURATION
  );

  const [sessionSettingsVis, setSessionSettingsVis] = useState(false);
  const [sessionSettings, setSessionSettings] = useState<
    Record<string, SessionSettings>
  >({});

  // notes & AI
  const [currentNotes, setCurrentNotes] = useState("");
  const [currentSuggestion, setCurrentSuggestion] = useState("");

  const [isAutosaveEnabled] = useLocalStorage<boolean>(
    "tyrestats_autosave_enabled",
    true
  );
  const [autoSaveInterval] = useLocalStorage<number>(
    "tyrestats_autosave_interval",
    2.5
  );

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const isLoadingSession = useRef(false);
  const [, setSessions] = useLocalStorage<TySession[]>(
    "tyrestats_sessions",
    []
  );

  const [aiConfigSettings, setAIConfigSettings] = useState({
    model: "qwen/qwen3-32b",
    temperature: 0.7,
    top_p: 1,
    useExperimentalPrompt: false,
  });

  // Helper to convert Manual Stints (Array) to Recharts Data Format
  const manualTimelineData = useMemo(() => {
    if (manualStints.length === 0)
      return [{ name: "Strategy", soft: 0, medium: 0, hard: 0, wet: 0 }];

    // Recharts needs a single object for the bar to stack properly in one row
    // Or we map unique keys per stint.
    // The previous structure likely used: { name: 'Strategy', 'stint_0_soft': 10, 'stint_1_medium': 20 }
    const dataRow: TimelineData = { name: "Strategy" };
    manualStints.forEach((stint, index) => {
      // Create a unique key for Recharts stacking: "manual_index_tyreID"
      dataRow[`manual_${index}_${stint.tyre}`] = stint.laps;
    });
    return [dataRow];
  }, [manualStints]);

  // Helper to create the Stint Definitions for DashTimeline colors
  const manualTimelineStintsDef = useMemo(() => {
    const colors: Record<string, string> = {
      soft: "#dc2626",
      medium: "#eab308",
      hard: "#ffffff",
      wet: "#1d4ed8",
    };
    const labels: Record<string, string> = {
      soft: "S",
      medium: "M",
      hard: "H",
      wet: "W",
    };

    return manualStints.map((stint, index) => ({
      tyreId: stint.tyre,
      key: `manual_${index}_${stint.tyre}`, // Must match the data key above
      color: colors[stint.tyre],
      label: `${labels[stint.tyre]} (${stint.laps}L)`,
    }));
  }, [manualStints]);

  const stateRef = useRef({
    tyreData,
    raceConfig,
    tyrePreferences,
    currentNotes,
    currentSuggestion,
    manualStints,
    sessionSettings,
    aiConfigSettings,
  });

  // keep ref updated
  useEffect(() => {
    stateRef.current = {
      tyreData,
      raceConfig,
      tyrePreferences,
      currentNotes,
      currentSuggestion,
      manualStints,
      sessionSettings,
      aiConfigSettings,
    };
  }, [
    tyreData,
    raceConfig,
    tyrePreferences,
    currentNotes,
    currentSuggestion,
    manualStints,
    sessionSettings,
    aiConfigSettings,
  ]);

  // save function for either autosave or manual save
  const saveSession = useCallback(() => {
    if (!currentSessionId) return;

    // Read values from the ref instead of state directly
    const currentData = stateRef.current;

    setSessions((prevSessions) =>
      prevSessions.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              tyreData: currentData.tyreData,
              raceConfig: currentData.raceConfig,
              tyrePreferences: currentData.tyrePreferences,
              currentNotes: currentData.currentNotes,
              currentSuggestion: currentData.currentSuggestion,
              manualStints: currentData.manualStints,
              aiConfigSettings: currentData.aiConfigSettings,
              meta: {
                ...(currentData.sessionSettings["current"] || s.meta),
                lastModified: new Date().toISOString(),
              },
            }
          : s
      )
    );

    toast.success("Session saved");
  }, [currentSessionId, setSessions]);

  // Auto-save after ref changes
  useEffect(() => {
    if (!isAutosaveEnabled || !currentSessionId || isLoadingSession.current)
      return;
    const timeoutId = setTimeout(() => saveSession(), autoSaveInterval * 1000);
    return () => clearTimeout(timeoutId);
    // not dealing with this fuckass warning
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAutosaveEnabled,
    autoSaveInterval,
    currentSessionId,
    tyreData,
    raceConfig,
    tyrePreferences,
    currentNotes,
    sessionSettings,
    currentSuggestion,
    manualStints,
    aiConfigSettings,
  ]);

  // please boss im tired of this fuckass god component
  // im truly the best programmer to ever live

  // ctrl+s
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveSession();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [saveSession]);

  const handleSaveTyreData = (data: TyreWearData) => {
    if (selectedTyre) {
      setTyreData((prev) => ({
        ...prev,
        [selectedTyre]: data,
      }));
      settyremanVis(false);
    }
  };

  // return how many laps recommended to run on this tyre based on switchover point
  const calcRecommendedLapCount = (wearPerLap: number) => {
    if (wearPerLap === 0) return 0;
    return Math.floor(
      (100 - tyrePreferences.preferredSwitchoverPoint) / wearPerLap
    );
  };

  // timeline auto regenerator
  useEffect(() => {
    const hasRaceConfig = raceConfig && raceConfig.RaceLaps > 0;
    const hasTyreData = Object.keys(tyreData).length > 0;

    if (hasRaceConfig && hasTyreData) {
      const result = generateOptimalTimeline(
        raceConfig,
        tyrePreferences,
        tyreData
      );
      if (result) {
        setAutoTimelineData(result.timelineData);
        setAutoTimelineStints(result.timelineStints);
        setTimelineGenerates(true);
      }
    } else {
      setTimelineGenerates(false);
      setAutoTimelineData([
        { name: "Strategy", soft: 0, medium: 0, hard: 0, wet: 0 },
      ]);
      setAutoTimelineStints([]);
    }
  }, [tyreData, raceConfig, tyrePreferences]);

  const loadSession = (session: TySession) => {
    isLoadingSession.current = true;
    setCurrentSessionId(session.id);

    setTyreData(session.tyreData || {});
    setCurrentNotes(session.currentNotes || "");
    setRaceConfig(session.raceConfig || DEFAULT_RACECONFIGURATION);
    setTyrePreferences(session.tyrePreferences || DEFAULT_PREFERENCES);
    setCurrentSuggestion(session.currentSuggestion || "");
    setAIConfigSettings({
      model: session.aiConfigSettings?.model || "qwen/qwen3-32b",
      temperature: session.aiConfigSettings?.temperature || 0.7,
      top_p: session.aiConfigSettings?.top_p || 1,
      useExperimentalPrompt: (session.aiConfigSettings as AIStrategySettingsS)?.useExperimentalPrompt ?? false,
    });

    setManualStints(session.manualStints || []);

    setSessionSettings({ current: session.meta });
    setTimeout(() => {
      isLoadingSession.current = false;
    }, 1000);
  };

  function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const check = () => setIsMobile(window.innerWidth < 1024);
      check();
      window.addEventListener("resize", check);
      return () => window.removeEventListener("resize", check);
    }, []);

    useEffect(() => {
      const ua = navigator.userAgent;
      const mobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          ua
        );
      if (mobile) setIsMobile(true);
    }, []);

    return isMobile;
  }
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-5rem)] p-8 bg-neutral-800">
        <p className="text-white text-lg font-extralight text-center">
          TyreStats is desktop-only for now.
          <br />
          Please use a PC or laptop.
        </p>
      </div>
    );
  }

  return (
    <>
      {currentSessionId && (
        <div className="overflow-hidden h-[calc(100vh-5rem)] p-8">
          {raceSettingsVis && (
            <RaceSettings
              currentConfig={raceConfig}
              currentManualStints={manualStints}
              tyreData={tyreData}
              tyrePreferences={tyrePreferences}
              autoTimelineData={autoTimelineData}
              autoTimelineStints={autoTimelineStints}
              isAutoGenerated={timelineGenerated}
              onClose={() => setRaceSettingsVis(false)}
              onSave={(config, newStints) => {
                setRaceConfig(config);
                setManualStints(newStints);
                if (newStints.length > 0) setIsManualMode(true);
              }}
            />
          )}
          {tyresettingsVis && (
            <TyreSettings
              currentPreferences={tyrePreferences}
              onClose={() => settyresettingsVis(false)}
              onSave={setTyrePreferences}
            />
          )}
          {tyremanVis && selectedTyre && (
            <TyreWearManager
              tyreType={selectedTyre}
              onClose={() => settyremanVis(false)}
              onSave={handleSaveTyreData}
            />
          )}
          {sessionSettingsVis && (
            <SessionSettingsPage
              currentConfig={sessionSettings["current"]}
              onClose={() => setSessionSettingsVis(false)}
              onSave={(settings) =>
                setSessionSettings((prev) => ({ ...prev, current: settings }))
              }
              DeleteThisSession={() => {
                setSessions((prev) =>
                  prev.filter((s) => s.id !== currentSessionId)
                );
                setCurrentSessionId(null);
              }}
              DuplicateThisSession={() => {
                setSessions((prev) => {
                  const sessionToDuplicate = prev.find((s) => s.id === currentSessionId);
                  if (!sessionToDuplicate) return prev;
                  const newId = `${sessionToDuplicate.id}_copy_${Date.now()}`;
                  const duplicatedSession: TySession = {
                    ...sessionToDuplicate,
                    id: newId,
                    meta: {
                      ...sessionToDuplicate.meta,
                      name: `${sessionToDuplicate.meta.name} (Copy)`,
                      lastModified: new Date().toISOString(),
                    },
                  };
                  setCurrentSessionId(newId);
                  setSessionSettings({ current: duplicatedSession.meta });
                  setTyreData(duplicatedSession.tyreData || {});
                  setCurrentNotes(duplicatedSession.currentNotes || "");
                  setRaceConfig(duplicatedSession.raceConfig || DEFAULT_RACECONFIGURATION);
                  setTyrePreferences(duplicatedSession.tyrePreferences || DEFAULT_PREFERENCES);
                  setCurrentSuggestion(duplicatedSession.currentSuggestion || "");
                  setAIConfigSettings({
                    model: duplicatedSession.aiConfigSettings?.model || "qwen/qwen3-32b",
                    temperature: duplicatedSession.aiConfigSettings?.temperature || 0.7,
                    top_p: duplicatedSession.aiConfigSettings?.top_p || 1,
                    useExperimentalPrompt: duplicatedSession.aiConfigSettings?.useExperimentalPrompt || false,
                  });
                  setManualStints(duplicatedSession.manualStints || []);
                  return [...prev, duplicatedSession];
                });
                setSessionSettingsVis(false);
              }}
            />
          )}

          <div className="bg-neutral-900 rounded-xl h-full p-4 flex flex-row gap-4">
            <DashSidebar
              currentSessionId={currentSessionId ?? ""}
              onSelectSession={loadSession}
            />

            <div className="w-3/4 h-full pl-4 bg-neutral-800 rounded-lg p-4 flex flex-col gap-2">
              <div className="flex flex-row justify-between items-center">
                <h2 className="text-white font-semibold text-2xl flex flex-row gap-2 items-center">
                  {sessionSettings["current"]?.name || "Session/Race Name"}
                  <button
                    className="cursor-pointer text-neutral-500 hover:text-neutral-300"
                    onClick={() => setSessionSettingsVis(true)}
                  >
                    <Pencil />
                  </button>
                </h2>
              </div>
              <hr className="border-neutral-700" />

              {/* Timeline Section */}
              <DashTimeline
                timelineGenerated={
                  isManualMode ? manualStints.length > 0 : timelineGenerated
                }
                timelineData={
                  isManualMode ? manualTimelineData : autoTimelineData
                }
                timelineStints={
                  isManualMode ? manualTimelineStintsDef : autoTimelineStints
                }
                tyreData={tyreData}
                setRaceSettingsVis={setRaceSettingsVis}
                raceConfig={raceConfig}
                isManualMode={isManualMode}
                setIsManualMode={setIsManualMode}
              />

              {/* top tiles section - tyres and ai */}
              <div className="w-full flex flex-row h-2/5 gap-2">
                {/* tyressssssss */}
                <div className="bg-neutral-900 rounded-lg p-4 w-2/7 h-full flex flex-col gap-2">
                  <div className="flex flex-row gap-2 justify-between">
                    <p className="text-md font-bold">Tyres</p>
                    <button
                      className="cursor-pointer text-sm"
                      onClick={() => settyresettingsVis(true)}
                    >
                      <Settings className="h-5 w-5" />
                    </button>
                  </div>
                  {TYRE_TYPES.map((tyre) => {
                    const effectiveData = getEffectiveTyreData(
                      tyre.id,
                      tyreData,
                      tyrePreferences
                    );
                    return (
                      <div
                        key={tyre.id}
                        className="bg-neutral-800 rounded-md p-2 px-4 w-full h-1/4 flex flex-row items-center gap-4"
                      >
                        <button
                          onClick={() => {
                            setSelectedTyre(tyre.id);
                            settyremanVis(true);
                          }}
                        >
                          <h3
                            className={`${tyre.color} text-2xl border-3 font-extrabold rounded-full px-2 cursor-pointer`}
                          >
                            {tyre.label}
                          </h3>
                        </button>
                        <div className="flex flex-col">
                          {effectiveData ? (
                            <>
                              <p className="text-neutral-400 text-xs">
                                {effectiveData.isEstimated ? "Est. " : ""}
                                Average wear per lap:{" "}
                                {effectiveData.wearPerLap.toFixed(2)}%
                              </p>
                              <p className="text-neutral-400 text-xs">
                                Recommended Lap Count:{" "}
                                {calcRecommendedLapCount(
                                  effectiveData.wearPerLap
                                )}{" "}
                                (
                                {(
                                  100 -
                                  effectiveData.wearPerLap *
                                    calcRecommendedLapCount(
                                      effectiveData.wearPerLap
                                    )
                                ).toFixed(2)}
                                %)
                              </p>
                            </>
                          ) : (
                            <p className="text-neutral-400 text-xs">
                              No Data Yet (Click on the tyre to add data)
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* AI strategy overview cause i cant think of anything better */}
                <AIStrategySuggestion
                  tyreData={tyreData}
                  raceConfig={raceConfig}
                  tyrePreferences={tyrePreferences}
                  notes={currentNotes}
                  existingSuggestion={currentSuggestion}
                  onSave={(suggestion: string) =>
                    setCurrentSuggestion(suggestion)
                  }
                  onSaveConfig={(newConfig: {
                    model: string;
                    temperature: number;
                    top_p: number;
                    useExperimentalPrompt: boolean;
                  }) => setAIConfigSettings(newConfig)}
                  aiConfig={{
                    model: aiConfigSettings.model,
                    temperature: aiConfigSettings.temperature,
                    top_p: aiConfigSettings.top_p,
                    useExperimentalPrompt: aiConfigSettings.useExperimentalPrompt,
                  }}
                />
              </div>

              {/* Notes section*/}
              <DashNotes notes={currentNotes} onChange={setCurrentNotes} />
            </div>
          </div>
        </div>
      )}
      {!currentSessionId && (
        <div className="overflow-hidden h-[calc(100vh-5rem)] p-8">
          <div className="bg-neutral-900 rounded-xl h-full p-4 flex flex-row gap-4">
            <DashSidebar
              currentSessionId={currentSessionId || ""}
              onSelectSession={loadSession}
            />

            {/* Main Dashboard Thingy */}
            <div className="w-3/4 h-full pl-4 bg-neutral-800 rounded-lg p-4 flex flex-col gap-2 items-center justify-center">
              <p className="text-white text-lg font-extralight">
                No session selected. Please select a session from the sidebar.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
