import { RaceConfiguration } from "./components/RaceSettings";
import { TyrePreferences } from "./components/TyreSettings";
import { TyreWearData } from "./components/TyreWearManager";

const TYRE_TYPES = [
  { id: "soft", label: "S", color: "text-red-600" },
  { id: "medium", label: "M", color: "text-yellow-500" },
  { id: "hard", label: "H", color: "text-white" },
  { id: "wet", label: "W", color: "text-blue-700" },
] as const;

export const getEffectiveTyreData = (
  tyreId: string,
  tyreData: Record<string, TyreWearData>,
  tyrePreferences: TyrePreferences
) => {
  // 1. Real data
  if (tyreData[tyreId]) {
    return { ...tyreData[tyreId], isEstimated: false };
  }

  // 2. Skip wets
  if (tyreId === "wet") return null;

  // 3. Estimate
  const { softToMediumRatio, mediumToHardRatio } = tyrePreferences;
  let estimatedWearPerLap = 0;

  if (tyreData["medium"]) {
    const wm = tyreData["medium"].wearPerLap;
    if (tyreId === "soft") estimatedWearPerLap = wm * softToMediumRatio;
    else if (tyreId === "hard") estimatedWearPerLap = wm / mediumToHardRatio;
  } else if (tyreData["soft"]) {
    const ws = tyreData["soft"].wearPerLap;
    if (tyreId === "medium") estimatedWearPerLap = ws / softToMediumRatio;
    else if (tyreId === "hard")
      estimatedWearPerLap = ws / (softToMediumRatio * mediumToHardRatio);
  } else if (tyreData["hard"]) {
    const wh = tyreData["hard"].wearPerLap;
    if (tyreId === "medium") estimatedWearPerLap = wh * mediumToHardRatio;
    else if (tyreId === "soft")
      estimatedWearPerLap = wh * mediumToHardRatio * softToMediumRatio;
  }

  if (estimatedWearPerLap > 0) {
    return {
      wearPerLap: estimatedWearPerLap,
      remainingLife: 100,
      lapsDriven: 0,
      isEstimated: true,
    };
  }

  return null;
};

export const generateOptimalTimeline = (
  raceConfig: RaceConfiguration,
  tyrePreferences: TyrePreferences,
  tyreData: Record<string, TyreWearData>
) => {
  // 1. Get Race Laps
  const totalLaps = raceConfig?.RaceLaps ? raceConfig.RaceLaps : 50;

  if (!totalLaps || totalLaps <= 0) return null;

  // 2. Get Available Tyre Data & Max Laps
  const availableTyres: { id: string; maxLaps: number; color: string }[] = [];

  TYRE_TYPES.forEach((t) => {
    if (t.id === "wet") return; // Skip wet for dry strategy generation
    const data = getEffectiveTyreData(t.id, tyreData, tyrePreferences);
    if (data && data.wearPerLap > 0) {
      const usablePercentage = 100 - tyrePreferences.preferredSwitchoverPoint;
      // Allow a buffer for "stretching" (e.g. +10% extra wear if needed to finish)
      const maxLaps = Math.floor(usablePercentage / data.wearPerLap);

      availableTyres.push({
        id: t.id,
        maxLaps: maxLaps,
        color:
          t.id === "soft"
            ? "#dc2626"
            : t.id === "medium"
            ? "#eab308"
            : "#ffffff",
      });
    }
  });

  if (availableTyres.length === 0) return null;

  // 3. Find Strategy
  let bestStrategy: { tyreId: string; laps: number; color: string }[] | null =
    null;

  // Helper to check if a strategy is valid (uses 2+ compounds)
  const isValidComposition = (stints: typeof bestStrategy) => {
    if (!stints) return false;
    const compounds = new Set(stints.map((s) => s.tyreId));
    return compounds.size >= 2;
  };

  // Scoring weights for compounds (Higher is faster/better)
  const PACE_SCORE: Record<string, number> = {
    soft: 3,
    medium: 2,
    hard: 1,
  };

  const calculateScore = (stints: any[]) => {
    // Heavy penalty for pit stops to prioritize fewer stops
    // 500 points is more than max possible points from laps (e.g. 100 laps * 3 pts = 300)
    const stopPenalty = (stints.length - 1) * 500;

    const performanceScore = stints.reduce((acc, stint) => {
      return acc + stint.laps * (PACE_SCORE[stint.tyreId] || 0);
    }, 0);

    return performanceScore - stopPenalty;
  };

  const validStrategies: { stints: any[]; score: number }[] = [];

  const findAllCombinations = (currentLaps: number, currentStints: any[]) => {
    // Base case: Race finished
    if (currentLaps >= totalLaps) {
      if (isValidComposition(currentStints)) {
        // If we overshot, trim the last stint
        const excess = currentLaps - totalLaps;
        const finalStints = JSON.parse(JSON.stringify(currentStints));
        finalStints[finalStints.length - 1].laps -= excess;

        validStrategies.push({
          stints: finalStints,
          score: calculateScore(finalStints),
        });
      }
      return;
    }

    if (currentStints.length >= 12) return;

    // Try all available tyres
    for (const tyre of availableTyres) {
      const remainingRace = totalLaps - currentLaps;
      const stretchLimit = Math.floor(tyre.maxLaps * 1.2); // Allow pushing past preference by 20%

      let stintLength = tyre.maxLaps;

      // If we can finish the race with this tyre within stretch limit, do it.
      if (remainingRace <= stretchLimit) {
        stintLength = remainingRace;
      }

      // Optimization: Don't add a stint if it's tiny unless it finishes the race
      if (stintLength < 3 && remainingRace > stintLength) continue;

      findAllCombinations(currentLaps + stintLength, [
        ...currentStints,
        { tyreId: tyre.id, laps: stintLength, color: tyre.color },
      ]);
    }
  };

  findAllCombinations(0, []);

  if (validStrategies.length > 0) {
    // Sort by score descending (Highest score wins)
    validStrategies.sort((a, b) => b.score - a.score);
    bestStrategy = validStrategies[0].stints;
  }

  // 4. Map to Timeline Data
  if (bestStrategy) {
    const newTimelineData: any = { name: "Strategy" };
    const newStints: any[] = [];
    let cumulativeLaps = 0;

    bestStrategy.forEach((stint, index) => {
      const key = `stint_${index}`;
      newTimelineData[key] = stint.laps;

      const startLap = cumulativeLaps + 1;
      cumulativeLaps += stint.laps;
      const endLap = cumulativeLaps;

      newStints.push({
        key,
        tyreId: stint.tyreId,
        laps: stint.laps,
        color: stint.color,
        label: `${
          stint.tyreId.charAt(0).toUpperCase() + stint.tyreId.slice(1)
        } (Laps ${startLap}-${endLap})`,
      });
    });

    return {
      timelineData: [newTimelineData],
      timelineStints: newStints,
    };
  }

  return null;
};