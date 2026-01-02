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
  readOnly?: boolean;
  onClearTyreData: () => void;
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
  readOnly = false,
  onClearTyreData,
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
          isThereTyreData={Object.keys(tyreData).length > 0}
          ClearAllTyreData={onClearTyreData}
          onClose={() => settyresettingsVis(false)}
          onSave={setTyrePreferences}
        />
      )}
      <div className="flex h-full w-1/4 flex-col gap-2 rounded-lg bg-zinc-200 p-4 dark:bg-neutral-900">
        <div className="flex flex-row justify-between gap-2">
          <p className="text-md font-bold">Tyres</p>
          {!readOnly && (
            <button
              className="cursor-pointer text-sm"
              onClick={() => settyresettingsVis(true)}
            >
              <Settings className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="flex h-full grow flex-col justify-evenly gap-2 overflow-hidden">
          {TYRE_TYPES.map((tyre) => {
            const effectiveData = getEffectiveTyreData(
              tyre.id,
              tyreData,
              tyrePreferences,
            );
            return (
              <div
                key={tyre.id}
                className="@container flex max-h-1/4 min-h-0 w-full shrink grow flex-row items-center gap-4 rounded-md bg-zinc-300 p-2 px-4 dark:bg-neutral-800"
              >
                <button
                  disabled={readOnly}
                  onClick={() => {
                    setSelectedTyre(tyre.id);
                    settyremanVis(true);
                  }}
                  className={readOnly ? "cursor-default" : ""}
                >
                  <h3
                    className={`${tyre.color} rounded-full border-3 px-2 text-xl font-extrabold ${
                      !readOnly ? "cursor-pointer" : ""
                    }`}
                  >
                    {tyre.label}
                  </h3>
                </button>
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  {effectiveData ? (
                    <>
                      <p className="text-[clamp(8px,0.525vw,24px)] leading-tight text-zinc-800 dark:text-neutral-400">
                        {effectiveData.isEstimated ? "Est. " : ""}
                        Average wear per lap:{" "}
                        {effectiveData.wearPerLap.toFixed(2)}%
                      </p>
                      <p className="text-[clamp(8px,0.525vw,24px)] leading-tight text-zinc-800 dark:text-neutral-400">
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
                    <p className="text-[clamp(8px,0.525vw,24px)] leading-tight text-zinc-800 dark:text-neutral-400">
                      No Data Yet{" "}
                      {readOnly ? "" : "(Click on the tyre to add data)"}
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
