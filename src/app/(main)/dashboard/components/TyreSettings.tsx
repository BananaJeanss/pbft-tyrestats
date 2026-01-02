import { TyrePreferences } from "@/app/types/TyTypes";
import { Trash2, X } from "lucide-react";
import { useState } from "react";

export const DEFAULT_PREFERENCES: TyrePreferences = {
  preferredSwitchoverPoint: 40,
  softToMediumRatio: 1.4,
  mediumToHardRatio: 2.1,
};

interface TyreSettingsProps {
  currentPreferences?: TyrePreferences;
  isThereTyreData: boolean;
  ClearAllTyreData: () => void;
  onClose: () => void;
  onSave: (prefs: TyrePreferences) => void;
}

function DeleteAllTyreDataConfirmation({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="absolute top-0 left-0 z-100 flex h-full w-full items-center justify-center bg-neutral-950/95">
      <div className="flex w-96 flex-col gap-4 rounded-xl bg-zinc-100 p-6 dark:bg-neutral-900">
        <h3 className="text-lg font-semibold">Confirm Clear All Tyre Data</h3>
        <hr className="border-neutral-700" />
        <div className="flex flex-col gap-2">
          <p>
            Are you sure you want to clear ALL tyre data? This action cannot be
            undone.
          </p>
          <span className="text-sm font-extralight opacity-70">
            This does not reset preferences.
          </span>
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="cursor-pointer rounded-md bg-neutral-300 px-4 py-2 font-bold text-black transition hover:bg-neutral-400 dark:bg-neutral-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="cursor-pointer rounded-md bg-red-500 px-4 py-2 font-bold text-white transition hover:bg-red-800"
          >
            Clear Data
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TyreSettings({
  currentPreferences = DEFAULT_PREFERENCES,
  isThereTyreData,
  ClearAllTyreData,
  onClose,
  onSave,
}: TyreSettingsProps) {
  const [prefs, setPrefs] = useState<TyrePreferences>(currentPreferences);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const handleSave = () => {
    onSave(prefs);
    onClose();
  };

  return (
    <>
      {showDeleteConfirmation && (
        <DeleteAllTyreDataConfirmation
          onConfirm={() => {
            ClearAllTyreData();
            setShowDeleteConfirmation(false);
            onClose();
          }}
          onCancel={() => setShowDeleteConfirmation(false)}
        />
      )}
      <div className="absolute top-0 left-0 z-50 flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-950/95 p-8">
        <div className="flex w-full max-w-md flex-col gap-6 rounded-xl border border-neutral-800 bg-zinc-100 p-6 shadow-2xl dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Tyre Settings</h2>
            <button onClick={onClose} className="cursor-pointer">
              <X />
            </button>
          </div>

          <hr className="border-neutral-800" />

          <div className="flex flex-col gap-6">
            {/* Switchover Point */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">
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
                  className="w-24 rounded border border-neutral-700 bg-zinc-200 p-2 focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
                />
                <span className="text-sm">Tyre life remaining</span>
              </div>
              <p className="text-xs">
                Used to calculate recommended lap counts.
              </p>
            </div>

            <hr className="border-neutral-800" />

            {/* Estimation Ratios */}
            <div className="flex flex-col gap-4">
              <h3 className="text-md font-bold">Life Estimation Ratios</h3>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">
                  Soft to Medium Ratio
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm">1 Soft Lap = </span>
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
                    className="w-20 rounded border border-neutral-700 bg-zinc-200 p-2 focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
                  />
                  <span className="text-sm">Medium Laps</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">
                  Medium to Hard Ratio
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm">1 Medium Lap = </span>
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
                    className="w-20 rounded border border-neutral-700 bg-zinc-200 p-2 focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
                  />
                  <span className="text-sm">Hard Laps</span>
                </div>
              </div>
              <p className="text-xs">
                Used to estimate tyre life when data is missing.
              </p>
            </div>
            {isThereTyreData && (
              <>
                <hr className="border-neutral-800" />
                <div className="justify-center flex flex-col items-center gap-1">
                  <button
                    onClick={() => setShowDeleteConfirmation(true)}
                    className="cursor-pointer text-red-600 text-sm flex items-center gap-2 hover:underline"
                  >
                    <Trash2 className="inline h-5 w-5" /> Clear All Tyre Data
                  </button>
                </div>
                <hr className="border-neutral-800" />
              </>
            )}
          </div>

          <button
            onClick={handleSave}
            className="mt-2 w-full cursor-pointer rounded-lg bg-neutral-300 py-3 font-bold text-black transition hover:bg-neutral-200"
          >
            Save Settings
          </button>
        </div>
      </div>
    </>
  );
}
