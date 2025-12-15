"use client";

import { Pencil, Settings } from "lucide-react";
import TyreWearManager, { TyreWearData } from "./components/TyreWearManager";
import { useEffect, useState, useRef } from "react";
import TyreSettings, {
  TyrePreferences,
  DEFAULT_PREFERENCES,
} from "./components/TyreSettings";
import RaceSettings, {
  RaceConfiguration,
  DEFAULT_RACECONFIGURATION,
} from "./components/RaceSettings";
import DashSidebar from "./components/DashSidebar";
import AIStrategySuggestion from "./components/AIStrategySuggestion";
import DashNotes from "./components/DashNotes";
import { generateOptimalTimeline, getEffectiveTyreData } from "./TyreMath";
import DashTimeline from "./components/DashTimeline";
import SessionSettingsPage, {
  SessionSettings,
} from "./components/SessionSettings";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { Bounce, toast, ToastContainer } from "react-toastify";

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

  const [timelineData, setTimelineData] = useState<any[]>([
    {
      name: "Strategy",
      soft: 0,
      medium: 0,
      hard: 0,
      wet: 0,
    },
  ]);

  const [timelineStints, setTimelineStints] = useState<any[]>([]);
  const [timelineGenerated, setTimelineGenerates] = useState(false);

  const [raceSettingsVis, setRaceSettingsVis] = useState(false);
  const [raceConfig, setRaceConfig] = useState<RaceConfiguration>(
    DEFAULT_RACECONFIGURATION
  );

  const [sessionSettingsVis, setSessionSettingsVis] = useState(false);
  const [sessionSettings, setSessionSettings] = useState<
    Record<string, SessionSettings>
  >({});

  const [currentNotes, setCurrentNotes] = useState("");

  const [currentSuggestion, setCurrentSuggestion] = useState("");

  const [isAutosaveEnabled, setIsAutosaveEnabled] = useLocalStorage<boolean>(
    "tyrestats_autosave_enabled",
    true
  );
  const [autoSaveInterval, setAutoSaveInterval] = useLocalStorage<number>(
    "tyrestats_autosave_interval",
    2.5
  );

  // 1. Add state to track which ID is open
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // ref to prevent autosave on session load
  const isLoadingSession = useRef(false);

  // 2. Get access to the global sessions list
  const [sessions, setSessions] = useLocalStorage<any[]>(
    "tyrestats_sessions",
    []
  );

  const saveSession = () => {
    if (!currentSessionId) return;

    setSessions((prevSessions) =>
      prevSessions.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              tyreData,
              raceConfig,
              tyrePreferences,
              currentNotes,
              currentSuggestion,
              meta: {
                ...(sessionSettings["current"] || s.meta),
                lastModified: new Date().toISOString(),
              },
            }
          : s
      )
    );

    toast.success("Session saved");
  };

  // auto-Save Effect
  useEffect(() => {
    if (!isAutosaveEnabled) return;
    if (!currentSessionId) return;

    if (isLoadingSession.current) {
      isLoadingSession.current = false;
      return;
    }

    const timeoutId = setTimeout(saveSession, autoSaveInterval * 1000);

    return () => clearTimeout(timeoutId);
  }, [
    isAutosaveEnabled,
    autoSaveInterval,
    tyreData,
    raceConfig,
    tyrePreferences,
    currentNotes,
    sessionSettings,
    currentSuggestion,
    currentSessionId,
  ]);

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
        setTimelineData(result.timelineData);
        setTimelineStints(result.timelineStints);
        setTimelineGenerates(true);
      }
    } else {
      // Reset timeline if requirements are not met
      setTimelineGenerates(false);
      setTimelineData([
        {
          name: "Strategy",
          soft: 0,
          medium: 0,
          hard: 0,
          wet: 0,
        },
      ]);
      setTimelineStints([]);
    }
  }, [tyreData, raceConfig, tyrePreferences]);

  const loadSession = (session: any) => {
    isLoadingSession.current = true;
    setCurrentSessionId(session.id);

    setTyreData(session.tyreData || {});
    setCurrentNotes(session.currentNotes || "");
    setRaceConfig(session.raceConfig || DEFAULT_RACECONFIGURATION);
    setTyrePreferences(session.tyrePreferences || DEFAULT_PREFERENCES);
    setCurrentSuggestion(session.currentSuggestion || "");

    setSessionSettings({ current: session.meta });
  };

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
        className={"z-1000000"} // css is my passion
      />
      {currentSessionId && (
        <div className="overflow-hidden h-[calc(100vh-5rem)] p-8">
          {raceSettingsVis && (
            <RaceSettings
              currentConfig={raceConfig}
              onClose={function (): void {
                setRaceSettingsVis(false);
              }}
              onSave={function (config: RaceConfiguration): void {
                setRaceConfig(config);
              }}
            />
          )}
          {tyresettingsVis && (
            <TyreSettings
              currentPreferences={tyrePreferences}
              onClose={function (): void {
                settyresettingsVis(false);
              }}
              onSave={function (prefs: TyrePreferences): void {
                setTyrePreferences(prefs);
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
              onSave={(settings: SessionSettings) => {
                setSessionSettings((prev) => ({
                  ...prev,
                  current: settings,
                }));
              }}
              DeleteThisSession={() => {
                setSessions((prevSessions) =>
                  prevSessions.filter((s) => s.id !== currentSessionId)
                );
                setCurrentSessionId(null);
              }}
            />
          )}

          <div className="bg-neutral-900 rounded-xl h-full p-4 flex flex-row gap-4">
            <DashSidebar
              currentSessionId={currentSessionId}
              onSelectSession={loadSession}
            />

            {/* Main Dashboard Thingy */}
            <div className="w-3/4 h-full pl-4 bg-neutral-800 rounded-lg p-4 flex flex-col gap-2">
              <h2 className="text-white font-semibold text-2xl flex flex-row gap-2 items-center">
                {sessionSettings["current"]?.name || "Session/Race Name"}
                <button
                  className="cursor-pointer text-neutral-500 hover:text-neutral-300"
                  onClick={() => setSessionSettingsVis(true)}
                >
                  <Pencil />
                </button>
              </h2>
              <hr className="border-neutral-700" />

              {/* Timeline Section */}
              <DashTimeline
                timelineGenerated={timelineGenerated}
                timelineData={timelineData}
                timelineStints={timelineStints}
                tyreData={tyreData}
                setRaceSettingsVis={setRaceSettingsVis}
                raceConfig={raceConfig}
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
              currentSessionId={currentSessionId}
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
