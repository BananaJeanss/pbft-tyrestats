"use client";

import { CheckCircle2, Settings, XCircle } from "lucide-react";
import {
  Bar,
  BarChart,
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
  // per FIT regulations 2 or more compounds must be used
  if (timelineStints.length > 0) {
    const compounds = new Set(timelineStints.map((s) => s.tyreId));
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
}

export default function DashTimeline({
  timelineGenerated,
  timelineData,
  timelineStints,
  setRaceSettingsVis,
  raceConfig,
  isManualMode = false,
  setIsManualMode,
}: DashTimelineProps) {
  return (
    <div className="w-full bg-neutral-900 p-4 rounded-lg flex flex-col relative gap-2">
      <div className="w-full flex flex-row justify-between items-center">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold flex items-center gap-1.5 text-white">
            Timeline
          </h3>
          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-700">
            <span
              className={`text-xs font-bold px-2 cursor-pointer transition ${
                !isManualMode ? "text-white" : "text-neutral-500"
              }`}
              onClick={() => setIsManualMode(false)}
            >
              Auto
            </span>
            |
            <span
              className={`text-xs font-bold px-2 cursor-pointer transition ${
                isManualMode ? "text-white" : "text-neutral-500"
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
                    className="text-neutral-400 cursor-help"
                    title="Timeline uses two or more different tyre compounds."
                  >
                    FIT Valid
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span
                    className="text-neutral-400 cursor-help"
                    title="Timeline must have two or more different tyre compounds."
                  >
                    FIT Invalid
                  </span>
                </>
              )}
            </div>
          )}

          <button
            className="cursor-pointer text-neutral-400 hover:text-white transition"
            onClick={() => {
              setRaceSettingsVis(true);
            }}
          >
            <Settings />
          </button>
        </div>
      </div>

      {timelineGenerated ? (
        <div className="h-20 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={timelineData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
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
                  isAnimationActive={false} // smoother switching
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-20 w-full flex items-center justify-center border border-dashed border-neutral-800 rounded">
          <p className="text-neutral-500 text-sm">
            {isManualMode
              ? "No manual stints configured. Click Settings to add stints."
              : "Timeline not generated. Check race settings and tyre data."}
          </p>
        </div>
      )}

      <div className="flex justify-between text-xs text-neutral-500 px-1">
        <span>Start</span>
        <span>Finish ({raceConfig?.RaceLaps || 0} Laps)</span>
      </div>
    </div>
  );
}
