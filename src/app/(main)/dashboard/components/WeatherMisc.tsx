import { MiscStats, WeatherEntry } from "@/app/types/TyTypes";
import { Info, Plus, Settings, Trash2, X } from "lucide-react";
import { DynamicIcon, iconNames } from "lucide-react/dynamic";
import { useState } from "react";

type IconName = (typeof iconNames)[number];

export interface WeatherMiscProps {
  readOnly: boolean;
  weather: WeatherEntry[];
  setWeather: (w: WeatherEntry[]) => void;
  miscStats: MiscStats;
  setMiscStats: (m: MiscStats) => void;
}

const WEATHER_PRESETS = [
  { label: "Clear", short: "Clear", icon: "sun" },
  { label: "Overcast", short: "OC", icon: "cloud" },
  { label: "Mist", short: "Mist", icon: "cloud-drizzle" },
  { label: "Fog", short: "Fog", icon: "cloud-fog" },
  { label: "Class 1 rain", short: "C1", icon: "cloud-drizzle" },
  { label: "Class 2 rain", short: "C2", icon: "cloud-rain" },
  { label: "Class 3 rain", short: "C3", icon: "cloud-lightning" },
  { label: "Class 4 rain", short: "C4", icon: "cloud-hail" },
  { label: "Sandstorm", short: "Sand", icon: "wind" },
  { label: "Light snow", short: "L.Snow", icon: "snowflake" },
  { label: "Heavy snow", short: "H.Snow", icon: "cloud-snow" },
];

interface WeatherMiscSettingsProps {
  onClose: () => void;
  weather: WeatherEntry[];
  setWeather: (w: WeatherEntry[]) => void;
  miscStats: MiscStats;
  setMiscStats: (m: MiscStats) => void;
}

function WeatherMiscSettings({
  onClose,
  weather,
  setWeather,
  miscStats,
  setMiscStats,
}: WeatherMiscSettingsProps) {
  const handleAddWeather = () => {
    let nextTime = "xx:00";
    if (weather.length > 0) {
      const lastTime = weather[weather.length - 1].time;
      const parts = lastTime.split(":");
      if (parts.length === 2) {
        const min = parseInt(parts[1]);
        if (!isNaN(min)) {
          const nextMin = (min + 10) % 60;
          nextTime = `${parts[0]}:${nextMin.toString().padStart(2, "0")}`;
        }
      }
    }

    setWeather([
      ...weather,
      { time: nextTime, condition: "Clear", icon: "sun" },
    ]);
  };

  const handleRemoveWeather = (index: number) => {
    const newWeather = [...weather];
    newWeather.splice(index, 1);
    setWeather(newWeather);
  };

  const updateWeather = (
    index: number,
    field: keyof WeatherEntry,
    value: string,
  ) => {
    const newWeather = [...weather];
    newWeather[index] = { ...newWeather[index], [field]: value };

    // If condition changes, update icon automatically based on preset
    if (field === "condition") {
      const preset = WEATHER_PRESETS.find(
        (p) => p.short === value || p.label === value,
      );
      if (preset) {
        newWeather[index].icon = preset.icon;
      }
    }

    setWeather(newWeather);
  };

  const updateMisc = (field: keyof MiscStats, value: string | number) => {
    setMiscStats({ ...miscStats, [field]: value });
  };

  return (
    <div className="absolute top-0 left-0 z-50 flex h-full w-full flex-col items-center justify-center bg-neutral-950/95 p-8">
      <div className="flex h-full max-h-[90%] w-full max-w-4xl flex-col gap-6 rounded-xl border border-neutral-800 bg-zinc-100 p-6 shadow-2xl dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Weather & Misc Settings</h2>
          <button
            onClick={onClose}
            className="cursor-pointer transition-colors hover:text-red-500"
          >
            <X />
          </button>
        </div>

        <hr className="border-neutral-800" />

        <div className="flex grow flex-col gap-6 overflow-y-auto pr-2">
          {/* Misc Stats Section */}
          <section className="flex flex-col gap-4">
            <h3 className="font-semibold text-neutral-500">
              Miscellaneous Stats
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-neutral-500 uppercase">
                  Avg Lap Time
                </label>
                {(() => {
                  const avgLapTime = miscStats.avgLapTime;
                  const valid = /^\d{1,2}:\d{2}(\.[0-9]{1,3})?$/.test(avgLapTime);
                  const typingProgress = /^\d{0,2}$|^\d{1,2}:?$|^\d{1,2}:\d{0,2}$|^\d{1,2}:\d{2}(\.[0-9]{0,3})?$/.test(avgLapTime);
                  const showInvalid = avgLapTime !== "" && !valid && !typingProgress;
                  return (
                    <input
                      type="text"
                      maxLength={10}
                      value={avgLapTime}
                      onChange={(e) => {
                        const v = e.target.value;
                        // Only save if valid or making progress toward valid input
                        if (/^\d{0,2}$|^\d{1,2}:?$|^\d{1,2}:\d{0,2}$|^\d{1,2}:\d{2}(\.[0-9]{0,3})?$/.test(v)) {
                          updateMisc("avgLapTime", v);
                        }
                      }}
                      className={`rounded border p-2 bg-zinc-200 dark:bg-neutral-800 ${showInvalid ? "border-red-500" : "border-neutral-700"}`}
                      placeholder="1:30.000"
                    />
                  );
                })()}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-neutral-500 uppercase">
                  Grid Position
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">P</span>
                  <input
                    type="number"
                    min={1}
                    max={miscStats.totalGridDrivers || 20}
                    value={miscStats.gridPosition}
                    onChange={(e) =>
                      updateMisc("gridPosition", parseInt(e.target.value) || 1)
                    }
                    className="w-full rounded border border-neutral-700 bg-zinc-200 p-2 dark:bg-neutral-800"
                  />
                  <span className="text-sm text-neutral-500">/</span>
                  <input
                    type="number"
                    min={1}
                    value={miscStats.totalGridDrivers}
                    max={128}
                    onChange={(e) =>
                      updateMisc(
                        "totalGridDrivers",
                        parseInt(e.target.value) || 20,
                      )
                    }
                    className="w-20 rounded border border-neutral-700 bg-zinc-200 p-2 dark:bg-neutral-800"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-neutral-500 uppercase">
                  Race Start Time
                </label>
                <input
                  type="text"
                  maxLength={9}
                  value={miscStats.raceStartTime}
                  onChange={(e) => updateMisc("raceStartTime", e.target.value)}
                  className="rounded border border-neutral-700 bg-zinc-200 p-2 dark:bg-neutral-800"
                  placeholder="14:00"
                />
              </div>
            </div>
          </section>

          <hr className="border-neutral-800" />

          {/* Weather Section */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-500">
                Weather Forecast
              </h3>
              {weather.length <= 20 && (
                <button
                    onClick={handleAddWeather}
                    className="flex cursor-pointer items-center gap-1 rounded bg-blue-600 px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-blue-700"
                >
                    <Plus size={14} /> Add Slot
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2">
              {weather.map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded bg-zinc-200 p-2 dark:bg-neutral-800"
                >
                  <div className="flex w-12 flex-col items-center gap-1">
                    <DynamicIcon
                      name={entry.icon as IconName}
                      className="h-6 w-6"
                    />
                  </div>
                  <div className="flex w-24 flex-col gap-1">
                    <label className="text-[10px] text-neutral-500 uppercase">
                      Time
                    </label>
                    {(() => {
                      // Accepts partial input for typing, but only nn:nn or xx:xx is valid
                      const timeVal = entry.time;
                      const valid = /^[\dx]{2}:[\dx]{2}$/i.test(timeVal);
                      const typingProgress = /^[\dx]{0,2}$|^[\dx]{2}:?$|^[\dx]{2}:[\dx]{0,2}$/i.test(timeVal);
                      const showInvalid = !valid && timeVal !== "" && typingProgress;
                      return (
                        <input
                          type="text"
                          maxLength={5}
                          value={timeVal}
                          onChange={(e) => {
                            // Only allow digits, 'x', and colon, max 5 chars
                            const v = e.target.value;
                            if (/^[\dx]{0,2}:?[\dx]{0,2}$/i.test(v)) {
                              updateWeather(idx, "time", v);
                            } else if (v === "") {
                              updateWeather(idx, "time", "");
                            }
                          }}
                          className={`w-full rounded border p-2 bg-transparent px-2 py-1 text-sm ${showInvalid ? "border-red-500" : "border-neutral-600"}`}
                          placeholder="hh:mm"
                        />
                      );
                    })()}
                  </div>
                  <div className="flex grow flex-col gap-1">
                    <label className="text-[10px] text-neutral-500 uppercase">
                      Condition
                    </label>
                    <select
                      value={entry.condition}
                      onChange={(e) =>
                        updateWeather(idx, "condition", e.target.value)
                      }
                      className="w-full rounded border border-neutral-600 bg-transparent px-2 py-1 text-sm"
                    >
                      {WEATHER_PRESETS.map((p) => (
                        <option key={p.label} value={p.short}>
                          {p.label} ({p.short})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => handleRemoveWeather(idx)}
                    className="mx-2 cursor-pointer rounded p-1 text-neutral-500 hover:bg-red-900/20 hover:text-red-500"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              ))}
              {weather.length === 0 && (
                <p className="py-4 text-center text-sm text-neutral-500">
                  No weather data. Add a slot to start.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function WeatherMisc({
  readOnly,
  weather,
  setWeather,
  miscStats,
  setMiscStats,
}: WeatherMiscProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      {settingsOpen && (
        <WeatherMiscSettings
          onClose={() => setSettingsOpen(false)}
          weather={weather}
          setWeather={setWeather}
          miscStats={miscStats}
          setMiscStats={setMiscStats}
        />
      )}
      <div className="flex w-3/4 grow flex-col gap-2 rounded-lg bg-zinc-200 p-4 dark:bg-neutral-900">
        <div className="flex flex-row items-center justify-between gap-2">
          <div className="flex flex-row items-center gap-1">
            <h3 className="text-lg font-bold">Weather & Miscellaneous Stats</h3>
            {!readOnly && (
              <span className="relative inline-block">
                <Info className="peer ml-2 inline-block h-4 w-4 cursor-pointer" />
                <span className="pointer-events-none absolute top-1/2 left-8 z-10 w-64 -translate-y-1/2 rounded bg-zinc-700 px-2 py-1 text-xs text-wrap text-white opacity-0 transition-opacity peer-hover:opacity-100">
                  Weather data and miscellaneous info may be used for timeline
                  generation and in AI strategy input.
                </span>
              </span>
            )}
          </div>
          <div className="flex flex-row items-center gap-4">
            {!readOnly && (
              <Settings
                className="cursor-pointer hover:text-blue-500"
                onClick={() => setSettingsOpen(true)}
              />
            )}
          </div>
        </div>
        <hr className="border-neutral-700" />
        <div
          className="flex h-24 shrink-0 flex-row items-center justify-start gap-1 overflow-x-scroll"
          style={{
            scrollbarColor: "#a3a3a3 transparent",
            scrollbarWidth: "thin",
          }}
        >
          {!weather || weather.length === 0 ? (
            <div className="flex w-full items-center justify-center">
              <span className="text-center text-neutral-500">
                No weather entries yet.
              </span>
            </div>
          ) : (
            weather.map(({ time, condition, icon }, idx) => (
              <div
                key={`${time}-${idx}`}
                className={`flex h-full min-w-25 grow flex-col items-center justify-center rounded bg-zinc-300 p-2 text-center dark:bg-neutral-800 ${
                  condition === "C4" || condition === "Class 4 rain"
                    ? "border border-red-600"
                    : ""
                } `}
              >
                <DynamicIcon name={icon as IconName} className="mb-1 h-6 w-6" />
                <span className="font-semibold">{time}</span>
                <span className="text-sm">{condition}</span>
              </div>
            ))
          )}
        </div>
        <hr className="border-neutral-700" />
        {/* misc stats place */}
        <div className="flex w-full grow shrink-0 flex-row items-center justify-between gap-4 text-center px-4">
          <span
            className="cursor-help font-bold"
            title="Expected average lap time, used for strategy calculations."
          >
            Average Lap Time
            <span className="block font-normal">
              {miscStats?.avgLapTime || "-"}
            </span>
          </span>
          <span
            className="cursor-help font-bold"
            title="Starting/Quali position, account for grid penalties."
          >
            Grid Position
            {/* could word it as quali position but account for user putting in penalties maybe */}
            <span className="block font-normal">
              P{miscStats?.gridPosition || "-"}/
              {miscStats?.totalGridDrivers || "-"}
            </span>
          </span>
          <span
            className="cursor-help font-bold"
            title="Race Start Time, when the lights go out"
          >
            Race Start Time
            <span className="block font-normal">
              {miscStats?.raceStartTime || "-"}
            </span>
          </span>
        </div>
      </div>
    </>
  );
}
