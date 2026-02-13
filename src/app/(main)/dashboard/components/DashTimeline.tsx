"use client";

import { CheckCircle2, Settings, Share2Icon, XCircle } from "lucide-react";
import {
  Bar,
  BarChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  RaceConfiguration,
  TimelineData,
  TyreWearData,
} from "@/app/types/TyTypes";

const validateTimelineData = (
  timelineData: TimelineData[],
  timelineStints: { tyreId: string }[],
) => {
  // per FIT regulations 2 or more compounds must be used, unless if wet race
  if (timelineStints.length > 0) {
    const compounds = new Set(timelineStints.map((s) => s.tyreId));
    // Allow single compound if it's wet
    if (compounds.size === 1 && compounds.has("wet")) return true;
    return compounds.size >= 2;
  }

  const usedTyres = Object.values(timelineData[0]).filter(
    (val) => typeof val === "number" && val > 0,
  ).length;
  if (usedTyres < 2) {
    return false;
  } else {
    return true;
  }
};

interface DashTimelineProps {
  timelineGenerated: boolean;
  timelineData: TimelineData[];
  timelineStints: {
    tyreId: string;
    key: string;
    color: string;
    label: string;
  }[];
  tyreData: Record<string, TyreWearData>;
  setRaceSettingsVis: (vis: boolean) => void;
  raceConfig: RaceConfiguration;
  isManualMode?: boolean;
  setIsManualMode: (mode: boolean) => void;
  openDashShare: () => void;
  readOnly?: boolean;
  rainIntervals?: { startLap: number; endLap: number }[];
  redFlagLaps: { lap: number }[];
}

export default function DashTimeline({
  timelineGenerated,
  timelineData,
  timelineStints,
  setRaceSettingsVis,
  raceConfig,
  isManualMode = false,
  setIsManualMode,
  openDashShare,
  readOnly = false,
  rainIntervals = [],
  redFlagLaps = [],
}: DashTimelineProps) {
  return (
    <div className="relative flex w-full flex-col gap-2 rounded-lg bg-zinc-200 p-4 dark:bg-neutral-900">
      <div className="flex w-full flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="flex items-center gap-1.5 text-lg font-bold">
            Timeline
          </h3>
            <div className="flex items-center gap-1 rounded-lg border border-neutral-700 bg-transparent p-1">
              <span
                className={`cursor-pointer px-2 text-xs font-bold transition ${
                  !isManualMode
                    ? "text-black dark:text-white"
                    : "text-neutral-700 dark:text-neutral-500"
                }`}
                onClick={() => setIsManualMode(false)}
              >
                Auto
              </span>
              |
              <span
                className={`cursor-pointer px-2 text-xs font-bold transition ${
                  isManualMode
                    ? "text-black dark:text-white"
                    : "text-neutral-700 dark:text-neutral-500"
                }`}
                onClick={() => setIsManualMode(true)}
              >
                Manual
              </span>
            </div>
        </div>

        <div className="flex items-center gap-4">
          {timelineGenerated && (
            <div className="flex items-center gap-1 text-sm">
              {validateTimelineData(timelineData, timelineStints) ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span
                    className="cursor-help"
                    title="Timeline uses two or more different tyre compounds."
                  >
                    FIT Valid
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span
                    className="cursor-help"
                    title="Timeline must have two or more different tyre compounds."
                  >
                    FIT Invalid
                  </span>
                </>
              )}
            </div>
          )}

          {!readOnly && (
            <>
              <button
                className="hover: cursor-pointer transition"
                onClick={() => {
                  setRaceSettingsVis(true);
                }}
              >
                <Settings />
              </button>
              <button className="cursor-pointer" onClick={openDashShare}>
                <Share2Icon />
              </button>
            </>
          )}
        </div>
      </div>

      {timelineGenerated ? (
        <div className="h-20 w-full min-h-0 min-w-0" key={isManualMode ? "manual" : "auto"}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart
              layout="vertical"
              data={timelineData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <pattern
                  id="bluestripedPattern"
                  patternUnits="userSpaceOnUse"
                  width="8"
                  height="8"
                  patternTransform="rotate(45)"
                >
                  <rect
                    width="4"
                    height="8"
                    transform="translate(0,0)"
                    fill="#3b82f6"
                  />
                </pattern>
                <pattern
                  id="redstripedPattern"
                  patternUnits="userSpaceOnUse"
                  width="8"
                  height="8"
                  patternTransform="rotate(45)"
                >
                  <rect
                    width="4"
                    height="8"
                    transform="translate(0,0)"
                    fill="#ef4444"
                  />
                </pattern>
              </defs>
              <XAxis
                type="number"
                domain={[0, raceConfig?.RaceLaps || "auto"]}
                hide
              />
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
              {timelineStints.map((stint) => (
                <Bar
                  key={stint.key}
                  dataKey={stint.key}
                  stackId="a"
                  fill={stint.color}
                  name={stint.label}
                  isAnimationActive={false}
                  zIndex={1}
                />
              ))}

              {rainIntervals.map((interval, index) => (
                <ReferenceArea
                  key={`rain-${index}`}
                  x1={interval.startLap}
                  x2={interval.endLap}
                  fill="url(#bluestripedPattern)"
                  fillOpacity={0.3}
                  ifOverflow="visible"
                  label={{
                    value: `Rain (${interval.startLap} - ${interval.endLap})`,
                    fill: "#000",
                    fontSize: 18,
                    position: "center",
                  }}
                  zIndex={10}
                />
              ))}
              {redFlagLaps.map((redFlag, index) => (
                <ReferenceArea
                  key={`redflag-${index}`}
                  x1={redFlag.lap - 0.5}
                  x2={redFlag.lap + 0.5}
                  fill="url(#redstripedPattern)"
                  fillOpacity={0.3}
                  ifOverflow="visible"
                  label={{
                    value: `Red Flag (${redFlag.lap})`,
                    fill: "#000",
                    fontSize: 18,
                    position: "center",
                  }}
                  zIndex={10}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-20 w-full items-center justify-center rounded border border-dashed border-neutral-800">
          <p className="text-sm">
            {isManualMode
              ? "No manual stints configured. Click Settings to add stints."
              : "Timeline not generated. Check race settings and tyre data."}
          </p>
        </div>
      )}

      <div className="flex justify-between px-1 text-xs">
        <span>Start</span>

        <span>Finish ({raceConfig?.RaceLaps || 0} Laps)</span>
      </div>
    </div>
  );
}
