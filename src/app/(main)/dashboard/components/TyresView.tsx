import { Settings } from "lucide-react";
import { useState } from "react";
import { getEffectiveTyreData } from "../TyreMath";
import TyreSettings from "./TyreSettings";
import { TyrePreferences, TyreWearData } from "@/app/types/TyTypes";

export interface TyresViewProps {
  tyreData: Record<string, TyreWearData>;
  tyrePreferences: TyrePreferences;
  setTyrePreferences: (prefs: TyrePreferences) => void;
  settyremanVis: (vis: boolean) => void;
  setSelectedTyre: (tyreId: string) => void;
}

const TYRE_TYPES = [
  { id: "soft", label: "S", color: "text-red-600" },
  { id: "medium", label: "M", color: "text-yellow-500" },
  { id: "hard", label: "H", color: "text-white" },
  { id: "wet", label: "W", color: "text-blue-700" },
] as const;

export default function TyresView({
  tyreData,
  tyrePreferences,
  setTyrePreferences,
  settyremanVis,
  setSelectedTyre,
}: TyresViewProps) {
  const [tyresettingsVis, settyresettingsVis] = useState<boolean>(false);

  // return how many laps recommended to run on this tyre based on switchover point
  const calcRecommendedLapCount = (wearPerLap: number) => {
    if (wearPerLap === 0) return 0;
    return Math.floor(
      (100 - tyrePreferences.preferredSwitchoverPoint) / wearPerLap,
    );
  };

  return (
    <>
      {tyresettingsVis && (
        <TyreSettings
          currentPreferences={tyrePreferences}
          onClose={() => settyresettingsVis(false)}
          onSave={setTyrePreferences}
        />
      )}
      <div className="bg-zinc-200 dark:bg-neutral-900 rounded-lg p-4 w-2/7 h-full flex flex-col gap-2">
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
          const effectiveData = getEffectiveTyreData(
            tyre.id,
            tyreData,
            tyrePreferences,
          );
          return (
            <div
              key={tyre.id}
              className="bg-zinc-300 dark:bg-neutral-800 rounded-md p-2 px-4 w-full h-1/4 flex flex-row items-center gap-4"
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
                    <p className="text-zinc-800 dark:text-neutral-400 text-xs">
                      {effectiveData.isEstimated ? "Est. " : ""}
                      Average wear per lap:{" "}
                      {effectiveData.wearPerLap.toFixed(2)}%
                    </p>
                    <p className="text-zinc-800 dark:text-neutral-400 text-xs">
                      Recommended Lap Count:{" "}
                      {calcRecommendedLapCount(effectiveData.wearPerLap)} (
                      {(
                        100 -
                        effectiveData.wearPerLap *
                          calcRecommendedLapCount(effectiveData.wearPerLap)
                      ).toFixed(2)}
                      %)
                    </p>
                  </>
                ) : (
                  <p className="text-zinc-800 dark:text-neutral-400 text-xs">
                    No Data Yet (Click on the tyre to add data)
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
