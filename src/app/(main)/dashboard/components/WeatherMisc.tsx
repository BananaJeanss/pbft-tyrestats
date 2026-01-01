import { Info, Settings } from "lucide-react";
import { DynamicIcon, iconNames } from "lucide-react/dynamic";

type IconName = (typeof iconNames)[number];

export interface WeatherMiscProps {
  readOnly: boolean;
}

export default function WeatherMisc({ readOnly }: WeatherMiscProps) {
  // Improved data structure: array of weather entries with time, condition, and icon
  const weatherEntries = [
    { time: "xx:00", condition: "Clear", icon: "sun" },
    { time: "xx:10", condition: "Overcast", icon: "cloud" },
    { time: "xx:20", condition: "Mist", icon: "cloud-drizzle" },
    { time: "xx:30", condition: "Fog", icon: "cloud-fog" },
    { time: "xx:40", condition: "C1", icon: "cloud-snow" },
    { time: "xx:50", condition: "C2", icon: "cloud-hail" },
    { time: "x1:00", condition: "C3", icon: "cloud-rain" },
    { time: "x1:10", condition: "C4", icon: "cloud-lightning" },
    { time: "x1:20", condition: "Sandstorm", icon: "wind" },
    { time: "x1:30", condition: "Light snow", icon: "snowflake" },
    { time: "x1:40", condition: "Heavy snow", icon: "cloud-snow" },
  ];

  return (
    <>
      <div className="flex w-5/7 grow flex-col gap-2 rounded-lg bg-zinc-200 p-4 dark:bg-neutral-900">
        <div className="flex flex-row items-center justify-between gap-2">
          <div className="flex flex-row items-center gap-1">
            <h3 className="text-lg font-bold">Weather & Miscellaneous Stats</h3>
            {!readOnly && (
              <span className="relative inline-block">
                <Info className="peer ml-2 inline-block h-4 w-4 cursor-pointer" />
                <span className="w-87.5 text-wrap  pointer-events-none absolute top-1/2 left-8 z-10 -translate-y-1/2 rounded bg-zinc-700 px-2 py-1 text-xs text-white opacity-0 transition-opacity peer-hover:opacity-100">
                    Weather data and miscellaneous info may be used for timeline generation and in AI strategy input.
                </span>
              </span>
            )}
          </div>
          <div className="flex flex-row items-center gap-4">
            {!readOnly && <Settings className="cursor-pointer" />}
          </div>
        </div>
        <hr className="border-neutral-700" />
        <div
          className="flex min-h-24 flex-row items-center justify-center gap-1 overflow-x-auto"
          style={{
            scrollbarColor: "#a3a3a3 transparent",
            scrollbarWidth: "thin",
          }}
        >
          {weatherEntries.length === 0 ? (
            <span className="text-center text-neutral-500">
              No weather entries yet.
            </span>
          ) : (
            weatherEntries.map(({ time, condition, icon }) => (
              <div
                key={time}
                className="flex h-full min-w-25 flex-col items-center justify-center rounded bg-zinc-300 p-2 text-center dark:bg-neutral-800"
              >
                <DynamicIcon name={icon as IconName} className="mb-1 h-6 w-6" />
                <span className="font-semibold">{time}</span>
                <span className="text-sm">{condition}</span>
                {/* c4 is red flag by regulations so highlight it */}
                {condition === "C4" && (
                  <span className="mt-1 rounded bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                    Red Flag
                  </span>
                )}
              </div>
            ))
          )}
        </div>
        <hr className="border-neutral-700" />
        {/* misc stats place */}
        <div className="flex w-full grow flex-row items-center justify-center gap-8 text-center">
          <span
            className="cursor-help font-bold"
            title="Expected average lap time, used for strategy calculations."
          >
            Average Lap Time
            <span className="block font-normal">1:35.678</span>
          </span>
          <span
            className="cursor-help font-bold"
            title="Starting/Quali position, account for grid penalties."
          >
            Grid Position
            {/* could word it as quali position but account for user putting in penalties maybe */}
            <span className="block font-normal">P15/20</span>
          </span>
          <span
            className="cursor-help font-bold"
            title="Race Start Time, when the lights go out"
          >
            Race Start Time
            <span className="block font-normal">14:30</span>
          </span>
        </div>
      </div>
    </>
  );
}
