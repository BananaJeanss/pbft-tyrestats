import { TyrePreferences } from "@/app/types/TyTypes";
import { X } from "lucide-react";
import { useState } from "react";

export const DEFAULT_PREFERENCES: TyrePreferences = {
  preferredSwitchoverPoint: 40,
  softToMediumRatio: 1.4,
  mediumToHardRatio: 2.1,
};

interface TyreSettingsProps {
  currentPreferences?: TyrePreferences;
  onClose: () => void;
  onSave: (prefs: TyrePreferences) => void;
}

export default function TyreSettings({
  currentPreferences = DEFAULT_PREFERENCES,
  onClose,
  onSave,
}: TyreSettingsProps) {
  const [prefs, setPrefs] = useState<TyrePreferences>(currentPreferences);

  const handleSave = () => {
    onSave(prefs);
    onClose();
  };

  return (
    <div className="w-full h-full absolute top-0 left-0 bg-neutral-950/95 flex flex-col items-center justify-center p-8 gap-2 z-50">
      <div className="w-full max-w-md bg-zinc-100 dark:bg-neutral-900 rounded-xl p-6 flex flex-col gap-6 border border-neutral-800 shadow-2xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold ">Tyre Settings</h2>
          <button onClick={onClose} className=" cursor-pointer">
            <X />
          </button>
        </div>

        <hr className="border-neutral-800" />

        <div className="flex flex-col gap-6">
          {/* Switchover Point */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold ">
              Preferred Switchover Point (%)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={prefs.preferredSwitchoverPoint}
                onChange={(e) =>
                  setPrefs({
                    ...prefs,
                    preferredSwitchoverPoint: parseFloat(e.target.value) || 0,
                  })
                }
                className="bg-zinc-200 dark:bg-neutral-800 border border-neutral-700 rounded p-2  w-24 focus:outline-none focus:ring-2 focus:ring-neutral-600"
              />
              <span className=" text-sm">Tyre life remaining</span>
            </div>
            <p className="text-xs ">
              Used to calculate recommended lap counts.
            </p>
          </div>

          <hr className="border-neutral-800" />

          {/* Estimation Ratios */}
          <div className="flex flex-col gap-4">
            <h3 className="text-md font-bold ">Life Estimation Ratios</h3>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold ">
                Soft to Medium Ratio
              </label>
              <div className="flex items-center gap-2">
                <span className=" text-sm">1 Soft Lap = </span>
                <input
                  type="number"
                  step="0.1"
                  value={prefs.softToMediumRatio}
                  onChange={(e) =>
                    setPrefs({
                      ...prefs,
                      softToMediumRatio: parseFloat(e.target.value) || 1,
                    })
                  }
                  className="bg-zinc-200 dark:bg-neutral-800 border border-neutral-700 rounded p-2  w-20 focus:outline-none focus:ring-2 focus:ring-neutral-600"
                />
                <span className=" text-sm">Medium Laps</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold ">
                Medium to Hard Ratio
              </label>
              <div className="flex items-center gap-2">
                <span className=" text-sm">1 Medium Lap = </span>
                <input
                  type="number"
                  step="0.1"
                  value={prefs.mediumToHardRatio}
                  onChange={(e) =>
                    setPrefs({
                      ...prefs,
                      mediumToHardRatio: parseFloat(e.target.value) || 1,
                    })
                  }
                  className="bg-zinc-200 dark:bg-neutral-800 border border-neutral-700 rounded p-2  w-20 focus:outline-none focus:ring-2 focus:ring-neutral-600"
                />
                <span className=" text-sm">Hard Laps</span>
              </div>
            </div>
            <p className="text-xs ">
              Used to estimate tyre life when data is missing.
            </p>
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
