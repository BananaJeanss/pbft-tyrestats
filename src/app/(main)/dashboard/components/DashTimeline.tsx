import { CheckCircle2, Settings, XCircle } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { RaceConfiguration } from "./RaceSettings";

const validateTimelineData = (
  timelineData: any[],
  timelineStints: { tyreId: string }[]
) => {
  // per FIT regulations 2 or more compounds must be used
  if (timelineStints.length > 0) {
    const compounds = new Set(timelineStints.map((s) => s.tyreId));
    return compounds.size >= 2;
  }

  const usedTyres = Object.values(timelineData[0]).filter(
    (val) => typeof val === "number" && val > 0
  ).length;
  if (usedTyres < 2) {
    return false;
  } else {
    return true;
  }
};

interface DashTimelineProps {
  timelineGenerated: boolean;
  timelineData: any[];
  timelineStints: {
    tyreId: string;
    key: string;
    color: string;
    label: string;
  }[];
  tyreData: Record<string, any>;
  setRaceSettingsVis: (vis: boolean) => void;
  raceConfig: Record<string, RaceConfiguration>;
}

export default function DashTimeline({
  timelineGenerated,
  timelineData,
  timelineStints,
  tyreData,
  setRaceSettingsVis,
  raceConfig,
}: DashTimelineProps) {
  return (
    <div className="w-full bg-neutral-900 p-4 rounded-lg flex flex-col gap-2">
      <div className="w-full flex flex-row justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          Timeline (
          {validateTimelineData(timelineData, timelineStints) ? (
            <>
              <CheckCircle2 className="inline h-5 w-5 text-green-500 mr-1" />
              <p title="2 or more tyre compounds used" className="cursor-help">
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
                itemSorter={(item: any) => {
                  const match = item.name.match(/Laps (\d+)-/);
                  return match ? parseInt(match[1]) : 0;
                }}
              />
              {timelineStints.map((stint, index) => (
                <Bar
                  key={stint.key}
                  dataKey={stint.key}
                  stackId="a"
                  fill={stint.color}
                  radius={[
                    index === 0 ? 4 : 0,
                    index === timelineStints.length - 1 ? 4 : 0,
                    index === timelineStints.length - 1 ? 4 : 0,
                    index === 0 ? 4 : 0,
                  ]}
                  name={stint.label}
                />
              ))}
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
          Finish (Lap {Object.values(raceConfig)[0]?.RaceLaps || "Not Set"})
        </span>
      </div>
    </div>
  );
}
