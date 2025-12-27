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
      (100 - tyrePreferences.preferredSwitchoverPoint) / wearPerLap
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
        <div className="flex flex-col flex-grow gap-2 justify-evenly overflow-y-auto">
          {TYRE_TYPES.map((tyre) => {
            const effectiveData = getEffectiveTyreData(
              tyre.id,
              tyreData,
              tyrePreferences
            );
            return (
              <div
                key={tyre.id}
                className="@container bg-zinc-300 dark:bg-neutral-800 rounded-md p-2 px-4 w-full max-h-1/4 flex flex-row flex-grow flex-shrink items-center gap-4"
              >
                <button
                  onClick={() => {
                    setSelectedTyre(tyre.id);
                    settyremanVis(true);
                  }}
                >
                  <h3
                    className={`${tyre.color} text-xl border-3 font-extrabold rounded-full px-2 cursor-pointer`}
                  >
                    {tyre.label}
                  </h3>
                </button>
                <div className="flex flex-col justify-center flex-1 min-w-0">
                  {effectiveData ? (
                    <>
                      <p className="text-zinc-800 dark:text-neutral-400 text-[clamp(8px,0.65vw,24px)] leading-tight">
                        {effectiveData.isEstimated ? "Est. " : ""}
                        Average wear per lap:{" "}
                        {effectiveData.wearPerLap.toFixed(2)}%
                      </p>
                      <p className="text-zinc-800 dark:text-neutral-400 text-[clamp(8px,0.65vw,24px)] leading-tight">
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
                    <p className="text-zinc-800 dark:text-neutral-400 text-[clamp(8px,0.65vw,24px)] leading-tight">
                      No Data Yet (Click on the tyre to add data)
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
