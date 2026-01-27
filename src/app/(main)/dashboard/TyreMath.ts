import {
  MiscStats,
  RaceConfiguration,
  Stint,
  TimelineData,
  WeatherEntry,
} from "@/app/types/TyTypes";
import { TyrePreferences } from "@/app/types/TyTypes";
import { TyreWearData } from "@/app/types/TyTypes";

interface StrategyStint {
  tyreId: string;
  laps: number;
  color: string;
}

const TYRE_TYPES = [
  { id: "soft", label: "S", color: "text-red-600" },
  { id: "medium", label: "M", color: "text-yellow-500" },
  { id: "hard", label: "H", color: "text-white" },
  { id: "wet", label: "W", color: "text-blue-700" },
] as const;

export const getEffectiveTyreData = (
  tyreId: string,
  tyreData: Record<string, TyreWearData>,
  tyrePreferences: TyrePreferences,
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

const balanceStrategy = (stints: StrategyStint[]) => {
  if (!stints || stints.length === 0) return stints;

  const balancedStints: StrategyStint[] = [];
  let currentGroup: StrategyStint[] = [stints[0]];

  // Group consecutive stints of the same tyre
  for (let i = 1; i < stints.length; i++) {
    if (stints[i].tyreId === stints[i - 1].tyreId) {
      currentGroup.push(stints[i]);
    } else {
      // We hit a different tyre, so balance the previous group and push
      pushBalancedGroup(currentGroup, balancedStints);
      currentGroup = [stints[i]];
    }
  }
  // Balance and push the final group
  pushBalancedGroup(currentGroup, balancedStints);

  return balancedStints;
};

const pushBalancedGroup = (
  group: StrategyStint[],
  targetArray: StrategyStint[],
) => {
  const totalLaps = group.reduce((sum, s) => sum + s.laps, 0);
  const count = group.length;

  // Basic integer division
  const baseLaps = Math.floor(totalLaps / count);
  const remainder = totalLaps % count;

  group.forEach((stint, index) => {
    // Distribute the remainder laps to the first few stints
    // e.g. 25 laps / 3 stints = 8 laps each, with 1 remainder
    // Result: 9, 8, 8
    const laps = baseLaps + (index < remainder ? 1 : 0);

    targetArray.push({
      ...stint,
      laps: laps,
    });
  });
};

export const generateOptimalTimeline = (
  raceConfig: RaceConfiguration,
  tyrePreferences: TyrePreferences,
  tyreData: Record<string, TyreWearData>,
  weather: WeatherEntry[],
  miscStats: MiscStats,
) => {
  // 1. Get Race Laps
  const totalLaps = raceConfig?.RaceLaps ? raceConfig.RaceLaps : 50;

  if (!totalLaps || totalLaps <= 0) return null;

  // 2. Get Available Tyre Data & Max Laps
  const availableTyres: { id: string; maxLaps: number; color: string }[] = [];

  // Determine if it's a full wet race BEFORE looping through tyre types
  const rainIntervals = rainLikelyLaps(
    weather,
    miscStats.raceStartTime,
    totalLaps,
    miscStats.avgLapTime,
  );

  const isFullWet =
    (Object.keys(tyreData).length === 1 && tyreData["wet"] !== undefined) ||
    (rainIntervals.length === 1 &&
      rainIntervals[0].startLap === 0 &&
      rainIntervals[0].endLap >= totalLaps);

  // find each tyre data for dry tyres
  TYRE_TYPES.forEach((t) => {
    // If it's full wet, ignore everything except the Wet tyre
    if (isFullWet && t.id !== "wet") return;

    // If it's DRY, ignore the Wet tyre (unless you want to allow it for mixed conditions)
    if (!isFullWet && t.id === "wet") return;

    const data =
      t.id === "wet"
        ? { wearPerLap: tyreData["wet"]?.wearPerLap || 0.5, isEstimated: false } // Default wet wear if missing
        : getEffectiveTyreData(t.id, tyreData, tyrePreferences);

    if (data && data.wearPerLap > 0) {
      const usablePercentage = 100 - tyrePreferences.preferredSwitchoverPoint;
      const maxLaps = Math.floor(usablePercentage / data.wearPerLap);

      availableTyres.push({
        id: t.id,
        maxLaps: maxLaps,
        color:
          t.id === "soft"
            ? "#dc2626"
            : t.id === "medium"
              ? "#eab308"
              : t.id === "wet"
                ? "#1d4ed8"
                : "#ffffff",
      });
    }
  });

  if (availableTyres.length === 0) return null;

  // 3. Find Strategy
  let bestStrategy: StrategyStint[] | null = null;

  // Helper to check if a strategy is valid (uses 2+ compounds)
  const isValidComposition = (stints: StrategyStint[]) => {
    if (!stints) return false;

    // If it's a wet race, we are allowed to use just one compound (Wets)
    if (isFullWet) return true;

    // if we only have 1 tyre type available (e.g. fixed setup), it's valid
    if (availableTyres.length === 1) return true;

    const compounds = new Set(stints.map((s) => s.tyreId));
    return compounds.size >= 2;
  };

  // Scoring weights for compounds (Higher is faster/better)
  const PACE_SCORE: Record<string, number> = {
    soft: 3,
    medium: 2,
    wet: 1, // scoring doesnt really matter for wets here
    hard: 1,
  };

  const calculateScore = (stints: StrategyStint[]) => {
    // Heavy penalty for pit stops to prioritize fewer stops
    const stopPenalty = (stints.length - 1) * 250;

    const performanceScore = stints.reduce((acc, stint) => {
      return acc + stint.laps * (PACE_SCORE[stint.tyreId] || 0);
    }, 0);

    return performanceScore - stopPenalty;
  };

  const validStrategies: { stints: StrategyStint[]; score: number }[] = [];

  const findAllCombinations = (
    currentLaps: number,
    currentStints: StrategyStint[],
  ) => {
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

    // adjust max stins based on lap count cause otherwise performance adios
    // dynamic didnt work that well so i'll just hardcore it fukitweball
    switch (true) {
      case currentLaps >= 200:
        if (currentStints.length >= 20) return;
        break;
      case currentLaps >= 150:
        if (currentStints.length >= 17) return;
        break;
      case currentLaps >= 100:
        if (currentStints.length >= 14) return;
        break;
      default:
        if (currentStints.length >= 12) return;
        break;
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

    // greedy
    const rawStrat = validStrategies[0].stints;

    // greedy fixer
    bestStrategy = balanceStrategy(rawStrat);
  }

  // 4. Map to Timeline Data
  if (bestStrategy) {
    const newTimelineData: TimelineData = { name: "Strategy" };
    const newStints: Stint[] = [];
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

// New helper to fix the 'x1', 'x2' parsing issue
const parseTimeToMinutes = (timeStr: string, raceStartTime: string): number => {
  const parts = timeStr.split(":");
  if (parts.length !== 2) return -1;

  const hStr = parts[0].toLowerCase(); // Normalize to lower case
  const m = parseInt(parts[1]);

  if (isNaN(m) || m < 0 || m >= 60) return -1;

  if (hStr.startsWith("x")) {
    const startParts = raceStartTime.split(":");
    if (startParts.length !== 2) return -1;

    const startH = parseInt(startParts[0]);
    if (isNaN(startH)) return -1;

    let offset = 0;

    const offsetStr = hStr.substring(1);
    if (offsetStr.length > 0 && !isNaN(Number(offsetStr))) {
      offset = Number(offsetStr);
    }

    return (startH + offset) * 60 + m;
  }

  const h = parseInt(hStr);
  if (isNaN(h) || h < 0 || h >= 24) return -1;

  return h * 60 + m;
};

export const rainLikelyLaps = (
  weather: WeatherEntry[],
  raceStartTime: string,
  totalLaps: number,
  avgLapTimeStr: string = "1:30.000",
): Array<{ startLap: number; endLap: number }> => {
  if (!weather || weather.length === 0 || !raceStartTime) return [];
  let accumulatedRedFlagDelay = 0; // cause red flag means no racing but the weather still changes

  // 1. Parse Avg Lap Time
  let avgLapSeconds = 90;
  const match = avgLapTimeStr.match(/^(\d+):(\d{2})(\.\d+)?$/);
  if (match) {
    const minutes = parseInt(match[1]);
    const seconds = parseFloat(match[2] + (match[3] || ""));
    avgLapSeconds = minutes * 60 + seconds;
  }
  if (avgLapSeconds <= 0) avgLapSeconds = 90;

  const startMins = parseTimeToMinutes(raceStartTime, raceStartTime);
  if (startMins === -1) return [];

  // 2. Map Weather to Laps
  const points = weather
    .map((w, index) => {
      const wMins = parseTimeToMinutes(w.time, raceStartTime); // Use new helper
      if (wMins === -1) return null;

      let diff = wMins - startMins - accumulatedRedFlagDelay;
      if (diff < -720) diff += 1440; // Handle midnight crossover
      if (diff < -60) return null; // Ignore weather from >1h before start

      // Calculation: Simple linear projection (Note: Drifts if pace changes drastically)
      const lap = diff < 0 ? 0 : Math.floor((diff * 60) / avgLapSeconds);

      if (w.condition.toUpperCase().includes("C4")) {
        const nextW = weather[index + 1];

        if (nextW) {
          const nextMins = parseTimeToMinutes(nextW.time, raceStartTime);
          let gap = nextMins - wMins;

          if (gap < 0) gap += 1440; // Midnight crossover

          accumulatedRedFlagDelay += gap;
        }
      }

      const isRain =
        ["c1", "c2", "c3"].some((c) => w.condition.toLowerCase().includes(c)) ||
        w.condition.toLowerCase().includes("rain");

      return { lap, isRain };
    })
    .filter((p): p is { lap: number; isRain: boolean } => p !== null)
    .sort((a, b) => a.lap - b.lap);

  if (points.length === 0) return [];

  // 3. Build Intervals (Fixed Logic)
  const intervals: Array<{ startLap: number; endLap: number }> = [];
  let currentStart: number | null = null;

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    const nextPt = points[i + 1];

    const blockEnd = nextPt ? nextPt.lap : totalLaps;

    if (pt.isRain) {
      if (currentStart === null) currentStart = pt.lap;

      if (!nextPt || !nextPt.isRain) {
        // Clamp endLap to totalLaps to avoid displaying past race end
        const finalEnd = Math.min(blockEnd, totalLaps);
        if (currentStart < totalLaps) {
          intervals.push({ startLap: currentStart, endLap: finalEnd });
        }
        currentStart = null;
      }
    } else {
      currentStart = null;
    }
  }

  return intervals;
};

export const redflagLikelyLaps = (
  weather: WeatherEntry[],
  raceStartTime: string,
  avgLapTimeStr: string = "1:30.000",
): Array<{ lap: number }> => {
  if (!weather || weather.length === 0 || !raceStartTime) return [];

  // Reuse parsing logic
  let avgLapSeconds = 90;
  const match = avgLapTimeStr.match(/^(\d+):(\d{2})(\.\d+)?$/);
  if (match) {
    const minutes = parseInt(match[1]);
    const seconds = parseFloat(match[2] + (match[3] || ""));
    avgLapSeconds = minutes * 60 + seconds;
  }
  if (avgLapSeconds <= 0) avgLapSeconds = 90;

  const startMins = parseTimeToMinutes(raceStartTime, raceStartTime);
  if (startMins === -1) return [];

  const redFlagLaps: Array<{ lap: number }> = [];

  weather.forEach((w) => {
    const wMins = parseTimeToMinutes(w.time, raceStartTime);
    if (wMins === -1) return;

    let diff = wMins - startMins;
    if (diff < -720) diff += 1440;
    if (diff < -60) return;

    const lap = diff < 0 ? 0 : Math.floor((diff * 60) / avgLapSeconds);

    // Strict C4 check or text check
    const isRedFlag =
      w.condition.toUpperCase().includes("C4") ||
      w.condition.toLowerCase().includes("red flag");

    if (isRedFlag) {
      redFlagLaps.push({ lap });
    }
  });

  return redFlagLaps.sort((a, b) => a.lap - b.lap);
};
