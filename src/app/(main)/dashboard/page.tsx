"use client";

import {
  Calendar,
  CheckCircle2,
  Clock,
  Settings,
  Tag,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import TyreWearManager, { TyreWearData } from "./tyrewear";
import { useEffect, useState } from "react";
import TyreSettings, {
  TyrePreferences,
  DEFAULT_PREFERENCES,
} from "./tyresettings";
import RaceSettings, { RaceConfiguration } from "./racesettings";

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

  const [timelineData, setTimelineData] = useState([
    {
      name: "Strategy",
      soft: 0,
      medium: 0,
      hard: 0,
      wet: 0,
    },
  ]);

  const [timelineGenerated, setTimelineGenerates] = useState(false);

  const [raceSettingsVis, setRaceSettingsVis] = useState(false);
  const [raceConfig, setRaceConfig] = useState<
    Record<string, RaceConfiguration>
  >({});

  const handleSaveTyreData = (data: TyreWearData) => {
    if (selectedTyre) {
      setTyreData((prev) => ({
        ...prev,
        [selectedTyre]: data,
      }));
      settyremanVis(false);
    }
  };

  // return how many laps recommended to run on this tyre, ideally imo 45% is the sweet spot
  const calcRecommendedLapCount = (wearPerLap: number) => {
    if (wearPerLap === 0) return 0;
    return Math.floor(
      (100 - tyrePreferences.preferredSwitchoverPoint) / wearPerLap
    );
  };

  const getEffectiveTyreData = (tyreId: string) => {
    // 1. Real data
    if (tyreData[tyreId]) {
      return { ...tyreData[tyreId], isEstimated: false };
    }

    // 2. Skip wets
    if (tyreId === "wet") return null;

    // 3. Estimate
    const { softToMediumRatio, mediumToHardRatio } = tyrePreferences;
    let estimatedWearPerLap = 0;

    if (tyreData["medium"]) {
      const wm = tyreData["medium"].wearPerLap;
      if (tyreId === "soft") estimatedWearPerLap = wm * softToMediumRatio;
      else if (tyreId === "hard") estimatedWearPerLap = wm / mediumToHardRatio;
    } else if (tyreData["soft"]) {
      const ws = tyreData["soft"].wearPerLap;
      if (tyreId === "medium") estimatedWearPerLap = ws / softToMediumRatio;
      else if (tyreId === "hard")
        estimatedWearPerLap = ws / (softToMediumRatio * mediumToHardRatio);
    } else if (tyreData["hard"]) {
      const wh = tyreData["hard"].wearPerLap;
      if (tyreId === "medium") estimatedWearPerLap = wh * mediumToHardRatio;
      else if (tyreId === "soft")
        estimatedWearPerLap = wh * mediumToHardRatio * softToMediumRatio;
    }

    if (estimatedWearPerLap > 0) {
      return {
        wearPerLap: estimatedWearPerLap,
        remainingLife: 100,
        lapsDriven: 0,
        isEstimated: true,
      };
    }

    return null;
  };

  const validateTimelineData = () => {
    // per FIT regulations 2 or more compounds must be used
    const usedTyres = Object.values(timelineData[0]).filter(
      (val) => typeof val === "number" && val > 0
    ).length;
    if (usedTyres < 2) {
      return false;
    } else {
      return true;
    }
  };

  const generateOptimalTimeline = () => {
    // 1. Get Race Laps
    const config = Object.values(raceConfig)[0];
    const totalLaps = config?.RaceLaps ? config.RaceLaps : 50;

    if (!totalLaps || totalLaps <= 0) return;

    // 2. Get Available Tyre Data & Max Laps
    const availableTyres: { id: string; maxLaps: number; color: string }[] = [];

    TYRE_TYPES.forEach((t) => {
      if (t.id === "wet") return; // Skip wet for dry strategy generation
      const data = getEffectiveTyreData(t.id);
      if (data && data.wearPerLap > 0) {
        const usablePercentage = 100 - tyrePreferences.preferredSwitchoverPoint;
        // Allow a buffer for "stretching" (e.g. +10% extra wear if needed to finish)
        const maxLaps = Math.floor(usablePercentage / data.wearPerLap);

        availableTyres.push({
          id: t.id,
          maxLaps: maxLaps,
          color:
            t.id === "soft"
              ? "#dc2626"
              : t.id === "medium"
              ? "#eab308"
              : "#ffffff",
        });
      }
    });

    if (availableTyres.length === 0) return;

    // 3. Find Strategy
    let bestStrategy: { tyreId: string; laps: number; color: string }[] | null =
      null;

    // Helper to check if a strategy is valid (uses 2+ compounds)
    const isValidComposition = (stints: typeof bestStrategy) => {
      if (!stints) return false;
      const compounds = new Set(stints.map((s) => s.tyreId));
      return compounds.size >= 2;
    };

    const findCombination = (
      depth: number,
      currentLaps: number,
      currentStints: any[]
    ): boolean => {
      // Base case: Race finished
      if (currentLaps >= totalLaps) {
        if (isValidComposition(currentStints)) {
          // If we overshot, trim the last stint
          const excess = currentLaps - totalLaps;
          const lastStint = currentStints[currentStints.length - 1];
          lastStint.laps -= excess;

          bestStrategy = currentStints;
          return true; // Found a valid one
        }
        return false;
      }

      if (currentStints.length >= 4) return false;

      const sortedTyres = [...availableTyres].sort(
        (a, b) => b.maxLaps - a.maxLaps
      );

      for (const tyre of sortedTyres) {
        const remainingRace = totalLaps - currentLaps;
        const stretchLimit = Math.floor(tyre.maxLaps * 1.2); // Allow pushing past preference

        let stintLength = tyre.maxLaps;

        // If we can finish the race with this tyre within stretch limit, do it.
        if (remainingRace <= stretchLimit) {
          stintLength = remainingRace;
        }

        // Optimization: Don't add a stint if it's tiny unless it finishes the race
        if (stintLength < 3 && remainingRace > stintLength) continue;

        if (
          findCombination(depth + 1, currentLaps + stintLength, [
            ...currentStints,
            { tyreId: tyre.id, laps: stintLength, color: tyre.color },
          ])
        ) {
          return true;
        }
      }

      return false;
    };

    findCombination(0, 0, []);

    // 4. Map to Timeline Data
    if (bestStrategy) {
      const newTimelineData: any = { name: "Strategy" };

      // Initialize all to 0
      newTimelineData.soft = 0;
      newTimelineData.medium = 0;
      newTimelineData.hard = 0;
      newTimelineData.wet = 0;

      const formattedTimeline = (bestStrategy as any[]).map((stint, index) => {
        const entry: any = { name: `Stint ${index + 1}` };
        // Reset others
        entry.soft = 0;
        entry.medium = 0;
        entry.hard = 0;
        entry.wet = 0;

        // Set active
        entry[stint.tyreId] = stint.laps;
        return entry;
      });

      const strategyData = {
        name: "Strategy",
        soft: 0,
        medium: 0,
        hard: 0,
        wet: 0,
      };

      (bestStrategy as any[]).forEach((stint) => {
        // @ts-ignore - dynamic key
        strategyData[stint.tyreId] += stint.laps;
      });

      setTimelineData([strategyData]);
      setTimelineGenerates(true);
    }
  };

  useEffect(() => {
    const config = Object.values(raceConfig)[0];
    const hasRaceConfig = config && config.RaceLaps > 0;
    const hasTyreData = Object.keys(tyreData).length > 0;

    if (hasRaceConfig && hasTyreData) {
      generateOptimalTimeline();
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
    }
  }, [tyreData, raceConfig, tyrePreferences]);

  return (
    <div className="overflow-hidden h-[calc(100vh-5rem)] p-8">
      {raceSettingsVis && (
        <RaceSettings
          currentConfig={raceConfig[selectedTyre || ""]}
          onClose={function (): void {
            setRaceSettingsVis(false);
          }}
          onSave={function (config: RaceConfiguration): void {
            setRaceConfig((prev) => ({
              ...prev,
              [selectedTyre || ""]: config,
            }));
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

      <div className="bg-neutral-900 rounded-xl h-full p-4 flex flex-row gap-4">
        {/* Sidebar Session Selection */}
        <div className="w-1/4 h-full bg-neutral-800 rounded-lg p-4">
          <div className="w-full h-2/12 bg-neutral-900 rounded-md p-2 flex flex-row gap-4">
            <Image
              src="/placeholder.png"
              alt="Track Logo"
              className="h-full w-2/8 rounded-md"
              width={256}
              height={256}
            />
            <div className="flex flex-col">
              <h2 className="text-white text-lg font-semibold">
                Track Name/Session Name
              </h2>
              <hr className="my-2 border-neutral-700" />
              <span className="flex flex-col">
                <div className="flex flex-row items-center text-neutral-400 text-sm">
                  <Calendar className="inline h-4 w-4 mr-2 text-neutral-400" />
                  Date
                </div>
                <div className="flex flex-row items-center text-neutral-400 text-sm">
                  <Clock className="inline h-4 w-4 mr-2 text-neutral-400" />
                  Edited on 12/12/2025
                </div>
                <div className="flex flex-row items-center text-neutral-400 text-sm">
                  <Tag className="inline h-4 w-4 mr-2 text-neutral-400" />
                  <div className="border rounded-4xl flex flex-row px-2 text-sm">
                    tag1
                  </div>
                </div>
              </span>
            </div>
          </div>
        </div>
        {/* Main Dashboard Thingy */}
        <div className="w-3/4 h-full pl-4 bg-neutral-800 rounded-lg p-4 flex flex-col gap-2">
          <h2 className="text-white font-semibold text-2xl">
            Track Name/Session Name
          </h2>
          <hr className="border-neutral-700" />

          {/* Timeline Section */}
          <div className="w-full bg-neutral-900 p-4 rounded-lg flex flex-col gap-2">
            <div className="w-full flex flex-row justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                Timeline (
                {validateTimelineData() ? (
                  <>
                    <CheckCircle2 className="inline h-5 w-5 text-green-500 mr-1" />
                    <p
                      title="2 or more tyre compounds used"
                      className="cursor-help"
                    >
                      FIT Valid
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle className="inline h-5 w-5 text-red-500" />
                    <p
                      title="Less than 2 different compounds used"
                      className="cursor-help"
                    >
                      FIT Invalid - At least 2 tyre compounds must be used
                    </p>
                  </>
                )}
                )
              </h3>
              <button
                className="cursor-pointer"
                onClick={() => {
                  setRaceSettingsVis(true);
                }}
              >
                <Settings />
              </button>
            </div>

            {timelineGenerated ? (
              <div className="h-16 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={timelineData}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    {/* Hide axes for a clean look */}
                    <XAxis type="number" domain={[0, "dataMax"]} hide />
                    <YAxis type="category" dataKey="name" hide />

                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{
                        backgroundColor: "#171717",
                        border: "1px solid #404040",
                        borderRadius: "0.5rem",
                        color: "#fff",
                      }}
                      itemStyle={{ color: "#fff" }}
                    />

                    {/* Stacked bars create the timeline segments */}
                    {/* radius prop rounds the corners: [topLeft, topRight, bottomRight, bottomLeft] */}
                    <Bar
                      dataKey="soft"
                      stackId="a"
                      fill="#dc2626"
                      radius={[4, 0, 0, 4]}
                      name="Soft (Laps 1-12)"
                    />
                    <Bar
                      dataKey="medium"
                      stackId="a"
                      fill="#eab308"
                      name="Medium (Laps 13-35)"
                    />
                    <Bar
                      dataKey="hard"
                      stackId="a"
                      fill="#ffffff"
                      radius={[0, 4, 4, 0]}
                      name="Hard (Laps 36-50)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-16 w-full">
                <p className="text-neutral-400 text-sm">
                  Timeline will be auto-generated once{" "}
                  {!Object.values(raceConfig)[0]?.RaceLaps &&
                  Object.keys(tyreData).length === 0
                    ? "the race settings and at least one tyre compound data has"
                    : !Object.values(raceConfig)[0]?.RaceLaps
                    ? "the race settings have"
                    : "at least one tyre compound data has"}{" "}
                  been added.
                </p>
              </div>
            )}

            <div className="flex justify-between text-xs text-neutral-500 px-1">
              <span>Start</span>
              <span>
                Finish (Lap{" "}
                {Object.values(raceConfig)[0]?.RaceLaps || "Not Set"})
              </span>
            </div>
          </div>
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
                const effectiveData = getEffectiveTyreData(tyre.id);
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
                            {effectiveData.isEstimated ? "Est. " : ""}Average
                            wear per lap: {effectiveData.wearPerLap.toFixed(2)}%
                          </p>
                          <p className="text-neutral-400 text-xs">
                            Recommended Lap Count:{" "}
                            {calcRecommendedLapCount(effectiveData.wearPerLap)}{" "}
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
            <div className="bg-neutral-900 rounded-lg p-4 w-5/7 h-full flex flex-col gap-2">
              <h3 className="text-lg font-bold">AI Strategy Overview</h3>
              <p>ai text output go here</p>
            </div>
          </div>

          {/* Notes section*/}
          <div className="bg-neutral-900 rounded-lg p-4 w-2/7 h-2/5 flex flex-col gap-2">
            <h3 className="font-semibold">Notes</h3>
            <textarea
              className="w-full h-full bg-neutral-800 rounded-md p-2 text-white resize-none focus:outline-none focus:ring-2 focus:ring-neutral-600"
              placeholder="Add your notes here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
