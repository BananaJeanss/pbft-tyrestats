import { X } from "lucide-react";
import { useState } from "react";

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
}

export default function RaceSettings({
  currentConfig = DEFAULT_RACECONFIGURATION,
  onClose,
  onSave,
}: RaceSettingsProps) {
  const [config, setConfig] = useState<RaceConfiguration>(currentConfig);

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  return (
    <div className="w-full h-full absolute top-0 left-0 bg-neutral-950/95 flex flex-col items-center justify-center p-8 gap-2 z-50">
      <div className="w-full max-w-md bg-neutral-900 rounded-xl p-6 flex flex-col gap-6 border border-neutral-800 shadow-2xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Race Settings</h2>
          <button onClick={onClose} className="text-neutral-400 cursor-pointer">
            <X />
          </button>
        </div>

        <hr className="border-neutral-800" />

        <div className="flex flex-col gap-6">
          {/* Switchover Point */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-neutral-300">
              Race Lap Amount
            </label>
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
              <span className="text-neutral-500 text-sm">laps</span>
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
