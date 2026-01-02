"use client";

import TyreWearManager from "./components/TyreWearManager";
import {
  Stint,
  TimelineData,
  TyrePreferences,
  TyreWearData,
  WeatherEntry,
  MiscStats,
} from "@/app/types/TyTypes";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import RaceSettings, {
  DEFAULT_RACECONFIGURATION,
} from "./components/RaceSettings";
import { RaceConfiguration } from "@/app/types/TyTypes";
import { ManualStint } from "@/app/types/TyTypes";
import DashSidebar from "./components/DashSidebar";
import { generateOptimalTimeline } from "./TyreMath";
import SessionSettingsPage, {
  SessionSettings,
} from "./components/SessionSettings";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { toast } from "react-toastify";
import { TySession } from "@/app/types/TyTypes";
import { AIStrategySettingsS } from "./components/AIStrategySettings";
import { DEFAULT_PREFERENCES } from "./components/TyreSettings";
import DashShare from "./components/DashShare";
import DashboardView from "./components/DashboardView";

export default function Dashboard() {
  const [tyremanVis, settyremanVis] = useState(false);
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
    DEFAULT_RACECONFIGURATION,
  );

  const [sessionSettingsVis, setSessionSettingsVis] = useState(false);
  const [sessionSettings, setSessionSettings] = useState<
    Record<string, SessionSettings>
  >({});

  // notes & AI
  const [currentNotes, setCurrentNotes] = useState("");
  const [currentSuggestion, setCurrentSuggestion] = useState("");
  const [shortUrl, setShortUrl] = useState<string>("");

  const [isAutosaveEnabled] = useLocalStorage<boolean>(
    "tyrestats_autosave_enabled",
    true,
  );
  const [autoSaveInterval] = useLocalStorage<number>(
    "tyrestats_autosave_interval",
    0.5,
  );

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const isLoadingSession = useRef(false);
  const [, setSessions] = useLocalStorage<TySession[]>(
    "tyrestats_sessions",
    [],
  );

  // asdasdfdsfdsf share
  const [dashShareOpen, setDashShareOpen] = useState(false);

  const [aiConfigSettings, setAIConfigSettings] = useState({
    model: "qwen/qwen3-32b",
    temperature: 0.7,
    top_p: 1,
    useExperimentalPrompt: false,
  });

  const [weather, setWeather] = useState<WeatherEntry[]>([]);
  const [miscStats, setMiscStats] = useState<MiscStats>(() => ({
    avgLapTime: "",
    gridPosition: 0,
    totalGridDrivers: 0,
    raceStartTime: "",
    pitLossTime: 0,
  }));

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
    shortUrl,
    manualStints,
    sessionSettings,
    aiConfigSettings,
    weather,
    miscStats,
  });

  // keep ref updated
  useEffect(() => {
    stateRef.current = {
      tyreData,
      raceConfig,
      tyrePreferences,
      currentNotes,
      currentSuggestion,
      shortUrl,
      manualStints,
      sessionSettings,
      aiConfigSettings,
      weather,
      miscStats,
    };
  }, [
    tyreData,
    raceConfig,
    tyrePreferences,
    currentNotes,
    currentSuggestion,
    shortUrl,
    manualStints,
    sessionSettings,
    aiConfigSettings,
    weather,
    miscStats,
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
              shortUrl: currentData.shortUrl,
              manualStints: currentData.manualStints,
              aiConfigSettings: currentData.aiConfigSettings,
              weather: currentData.weather,
              miscStats: currentData.miscStats,
              folder:
                currentData.sessionSettings["current"]?.folder || s.folder,
              meta: {
                ...(currentData.sessionSettings["current"] || s.meta),
                lastModified: new Date().toISOString(),
              },
            }
          : s,
      ),
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
    weather,
    miscStats,
    shortUrl,
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

  // timeline auto regenerator
  useEffect(() => {
    const hasRaceConfig = raceConfig && raceConfig.RaceLaps > 0;
    const hasTyreData = Object.keys(tyreData).length > 0;

    if (hasRaceConfig && hasTyreData) {
      const result = generateOptimalTimeline(
        raceConfig,
        tyrePreferences,
        tyreData,
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
    setShortUrl(session.shortUrl || "");
    setAIConfigSettings({
      model: session.aiConfigSettings?.model || "qwen/qwen3-32b",
      temperature: session.aiConfigSettings?.temperature || 0.7,
      top_p: session.aiConfigSettings?.top_p || 1,
      useExperimentalPrompt:
        (session.aiConfigSettings as AIStrategySettingsS)
          ?.useExperimentalPrompt ?? false,
    });
    setWeather(session.weather || []);
    setMiscStats(session.miscStats || {
      avgLapTime: "",
      gridPosition: 0,
      totalGridDrivers: 0,
      raceStartTime: "",
      pitLossTime: 0,
    });

    setManualStints(session.manualStints || []);

    setSessionSettings({
      current: { ...session.meta, folder: session.folder },
    });
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
          ua,
        );
      if (mobile) setIsMobile(true);
    }, []);

    return isMobile;
  }
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex h-[calc(100vh-5rem)] flex-col items-center justify-center bg-zinc-200 p-8 dark:bg-neutral-800">
        <p className="text-center text-lg font-extralight">
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
        <>
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
                  prev.filter((s) => s.id !== currentSessionId),
                );
                setCurrentSessionId(null);
              }}
              DuplicateThisSession={() => {
                setSessions((prev) => {
                  const sessionToDuplicate = prev.find(
                    (s) => s.id === currentSessionId,
                  );
                  if (!sessionToDuplicate) return prev;
                  const newId = `${sessionToDuplicate.id}_copy_${Date.now()}`;
                  const duplicatedSession: TySession = {
                    ...sessionToDuplicate,
                    id: newId,
                    shortUrl: "",
                    meta: {
                      ...sessionToDuplicate.meta,
                      name: `${sessionToDuplicate.meta.name} (Copy)`,
                      lastModified: new Date().toISOString(),
                    },
                  };
                  setCurrentSessionId(newId);
                  setSessionSettings({
                    current: {
                      ...duplicatedSession.meta,
                      folder: duplicatedSession.folder,
                    },
                  });
                  setTyreData(duplicatedSession.tyreData || {});
                  setCurrentNotes(duplicatedSession.currentNotes || "");
                  setRaceConfig(
                    duplicatedSession.raceConfig || DEFAULT_RACECONFIGURATION,
                  );
                  setTyrePreferences(
                    duplicatedSession.tyrePreferences || DEFAULT_PREFERENCES,
                  );
                  setCurrentSuggestion(
                    duplicatedSession.currentSuggestion || "",
                  );
                  setAIConfigSettings({
                    model:
                      duplicatedSession.aiConfigSettings?.model ||
                      "qwen/qwen3-32b",
                    temperature:
                      duplicatedSession.aiConfigSettings?.temperature || 0.7,
                    top_p: duplicatedSession.aiConfigSettings?.top_p || 1,
                    useExperimentalPrompt:
                      duplicatedSession.aiConfigSettings
                        ?.useExperimentalPrompt || false,
                  });
                  setWeather(duplicatedSession.weather || []);
                  setMiscStats(
                    duplicatedSession.miscStats || {
                      avgLapTime: "",
                      gridPosition: 0,
                      totalGridDrivers: 0,
                      raceStartTime: "",
                      pitLossTime: 0,
                    },
                  );
                  setManualStints(duplicatedSession.manualStints || []);
                  return [...prev, duplicatedSession];
                });
                setSessionSettingsVis(false);
              }}
            />
          )}
        </>
      )}

      {dashShareOpen && currentSessionId && (
        <DashShare
          key={currentSessionId}
          onClose={() => setDashShareOpen(false)}
          onShortUrlUpdate={(url) => setShortUrl(url)}
          SessionData={
            {
              id: currentSessionId,
              folder: null, // in share url we dont include folder info
              meta: {
                name: sessionSettings["current"]?.name || "Unnamed Session",
                date: sessionSettings["current"]?.date || "",
                lastModified:
                  sessionSettings["current"]?.lastModified ||
                  new Date().toISOString(),
                selectedIcon:
                  sessionSettings["current"]?.selectedIcon || "default",
                icon_url: sessionSettings["current"]?.icon_url,
              },
              raceConfig,
              tyrePreferences,
              tyreData,
              currentNotes,
              currentSuggestion,
              shortUrl,
              manualStints,
              aiConfigSettings,
              weather,
              miscStats,
            } as TySession
          }
        />
      )}

      <div className="h-[calc(100vh-5rem)] overflow-hidden p-8">
        <div className="flex h-full flex-row gap-4 rounded-xl bg-zinc-200 p-4 dark:bg-neutral-900">
          <DashSidebar
            currentSessionId={currentSessionId ?? ""}
            onSelectSession={loadSession}
          />

          {currentSessionId ? (
            <div className="h-full w-3/4">
              <DashboardView
                sessionName={
                  sessionSettings["current"]?.name || "Session/Race Name"
                }
                onEditSessionSettings={() => setSessionSettingsVis(true)}
                SessionData={{
                  id: currentSessionId,
                  folder: null, // in DashboardView we don't include folder info
                  meta: {
                    name: sessionSettings["current"]?.name || "Unnamed Session",
                    date: sessionSettings["current"]?.date || "",
                    lastModified:
                      sessionSettings["current"]?.lastModified || new Date().toISOString(),
                    selectedIcon:
                      sessionSettings["current"]?.selectedIcon || "default",
                    icon_url: sessionSettings["current"]?.icon_url,
                  },
                  raceConfig,
                  tyrePreferences,
                  tyreData,
                  currentNotes,
                  currentSuggestion,
                  shortUrl,
                  manualStints,
                  aiConfigSettings,
                  weather,
                  miscStats,
                }}
                timelineGenerated={timelineGenerated}
                autoTimelineData={autoTimelineData}
                autoTimelineStints={autoTimelineStints}
                manualTimelineData={manualTimelineData}
                manualTimelineStintsDef={manualTimelineStintsDef}
                isManualMode={isManualMode}
                setRaceSettingsVis={setRaceSettingsVis}
                settyremanVis={(vis, tyreType) => {
                  settyremanVis(vis);
                  if (tyreType) setSelectedTyre(tyreType);
                }}
                setSelectedTyre={(tyreId) => {
                  if (["soft", "medium", "hard", "wet"].includes(tyreId)) {
                    setSelectedTyre(
                      tyreId as "soft" | "medium" | "hard" | "wet",
                    );
                  } else {
                    setSelectedTyre(null);
                  }
                }}
                setTyrePreferences={setTyrePreferences}
                setCurrentNotes={setCurrentNotes}
                setCurrentSuggestion={setCurrentSuggestion}
                setAIConfigSettings={setAIConfigSettings}
                setWeather={setWeather}
                setMiscStats={setMiscStats}
                setIsManualMode={setIsManualMode}
                openDashShare={() => setDashShareOpen(true)}
              />
            </div>
          ) : (
            <div className="flex h-full w-3/4 flex-col items-center justify-center gap-2 rounded-lg bg-zinc-200 p-4 pl-4 dark:bg-neutral-800">
              <p className="text-lg font-extralight">
                No session selected. Please select a session from the sidebar.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
