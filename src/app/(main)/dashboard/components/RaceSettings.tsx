import { X } from "lucide-react";
import { useState } from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface RaceConfiguration {
  RaceLaps: number;
}

export const DEFAULT_RACECONFIGURATION: RaceConfiguration = {
  RaceLaps: 0,
};

interface RaceSettingsProps {
  currentConfig?: RaceConfiguration;
  onClose: () => void;
  onSave: (prefs: RaceConfiguration) => void;
  timelineData: any[];
  timelineStints: { key: string; color: string; label: string }[];
  timelineGenerated: boolean;
}

export default function RaceSettings({
  currentConfig = DEFAULT_RACECONFIGURATION,
  onClose,
  onSave,
  timelineData,
  timelineStints,
  timelineGenerated
}: RaceSettingsProps) {
  const [config, setConfig] = useState<RaceConfiguration>(currentConfig);

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  return (
    <div className="w-full h-full absolute top-0 left-0 bg-neutral-950/95 flex flex-col items-center justify-center p-8 gap-2 z-50">
      <div className="w-full max-w-9/10 bg-neutral-900 rounded-xl p-6 flex flex-col gap-6 border border-neutral-800 shadow-2xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            Race/Timeline Settings
          </h2>
          <button onClick={onClose} className="text-neutral-400 cursor-pointer">
            <X />
          </button>
        </div>

        <hr className="border-neutral-800" />

        <div className="flex flex-col gap-6">
          <div className="h-24 w-full">
            {timelineGenerated == true ? (
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
            ) : (
              <p className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">
              Timeline Not Generated
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={config.RaceLaps}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    RaceLaps: parseFloat(e.target.value) || 0,
                  })
                }
                className="bg-neutral-800 border border-neutral-700 rounded p-2 text-white w-24 focus:outline-none focus:ring-2 focus:ring-neutral-600"
              />
              <span className="text-neutral-500 text-sm">Race laps</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-neutral-300 text-black font-bold py-3 rounded-lg hover:bg-neutral-200 transition mt-2 cursor-pointer"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
