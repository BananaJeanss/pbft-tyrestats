import {
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

export const generateOptimalTimeline = (
  raceConfig: RaceConfiguration,
  tyrePreferences: TyrePreferences,
  tyreData: Record<string, TyreWearData>,
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
  let bestStrategy: StrategyStint[] | null = null;

  // Helper to check if a strategy is valid (uses 2+ compounds)
  const isValidComposition = (stints: StrategyStint[]) => {
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

  const calculateScore = (stints: StrategyStint[]) => {
    // Heavy penalty for pit stops to prioritize fewer stops
    // 500 points is more than max possible points from laps (e.g. 100 laps * 3 pts = 300)
    const stopPenalty = (stints.length - 1) * 500;

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

export const rainLikelyLaps = (
  weather: WeatherEntry[],
  raceStartTime: string,
  totalLaps: number,
  avgLapTimeStr: string = "1:30.000",
): Array<{ startLap: number; endLap: number }> => {
  if (!weather || weather.length === 0 || !raceStartTime) return [];

  // 1. Parse Avg Lap Time to Seconds
  let avgLapSeconds = 90;
  const match = avgLapTimeStr.match(/^(\d+):(\d{2})(\.\d+)?$/);
  if (match) {
    const minutes = parseInt(match[1]);
    const seconds = parseFloat(match[2] + (match[3] || ""));
    avgLapSeconds = minutes * 60 + seconds;
  }
  if (avgLapSeconds <= 0) avgLapSeconds = 90;

  // 2. Parse Times to Minutes
  const timeToMinutes = (timeStr: string) => {
    // Handles "HH:MM", "xx:MM", "x1:MM", "x2:MM" as relative to race start hour
    const parts = timeStr.split(":");
    if (parts.length !== 2) return -1;
    const hStr = parts[0];
    const m = parseInt(parts[1]);
    const h = parseInt(hStr);
    if (isNaN(m) || m < 0 || m >= 60) return -1;

    // Handle relative hour codes
    if (hStr === "xx") {
      // Parse raceStartTime hour
      const startParts = raceStartTime.split(":");
      if (startParts.length !== 2) return -1;
      const startH = parseInt(startParts[0]);
      if (isNaN(startH)) return -1;

      let offset = 0;
      // Handle x[n]:00 as n hours after race start (e.g. x1:00, x2:00)
      if (
        hStr.startsWith("x") &&
        hStr.length === 2 &&
        !isNaN(Number(hStr[1]))
      ) {
        offset = Number(hStr[1]);
      } else if (hStr.at(1) === "1") offset = 1;

      return (startH + offset) * 60 + m;
    }

    if (isNaN(h) || h < 0 || h >= 24) return -1;
    return h * 60 + m;
  };

  const startMins = timeToMinutes(raceStartTime);
  if (startMins === -1) return [];

  // 3. Map Weather to Lap Numbers
  const points = weather
    .map((w) => {
      const wMins = timeToMinutes(w.time);
      if (wMins === -1) return null;

      let diff = wMins - startMins;
      // Handle simple day rollover (start 23:00, weather 01:00)
      if (diff < -720) diff += 1440;
      // Handle pre-race weather defined way before
      if (diff < -60) return null;

      // If diff is negative but small (e.g. -5 mins), treat as Lap 0
      const lap = diff < 0 ? 0 : Math.floor((diff * 60) / avgLapSeconds);

      const isRain =
        ["C1", "C2", "C3"].some(
          (c) => w.condition.toUpperCase().includes(c), // Check short condition code
        ) || w.condition.toLowerCase().includes("rain");

      return { lap, isRain };
    })
    .filter((p): p is { lap: number; isRain: boolean } => p !== null)
    .sort((a, b) => a.lap - b.lap);

  if (points.length === 0) return [];

  // 4. Build Intervals
  const intervals: Array<{ startLap: number; endLap: number }> = [];
  let currentStart: number | null = null;

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    const nextPt = points[i + 1]; // undefined if last

    // Determine the end of this weather block
    // It ends at the next weather update, OR at the end of the race
    const blockEnd = nextPt ? nextPt.lap : totalLaps;

    if (pt.isRain) {
      // It is raining in this block.
      // If we aren't already tracking a rain interval, start one.
      if (currentStart === null) {
        currentStart = pt.lap;
      }

      if (!nextPt || !nextPt.isRain) {
        // Close it
        intervals.push({ startLap: currentStart, endLap: blockEnd });
        currentStart = null;
      }
    } else {
      currentStart = null; // Safety
    }
  }

  return intervals;
};

// same logic as rainLikelyLaps but for red flag conditions (c4)
export const redflagLikelyLaps = (
  weather: WeatherEntry[],
  raceStartTime: string,
  totalLaps: number,
  avgLapTimeStr: string = "1:30.000",
): Array<{ lap: number }> => {
  if (!weather || weather.length === 0 || !raceStartTime) return [];

  // 1. Parse Avg Lap Time to Seconds
  let avgLapSeconds = 90;
  const match = avgLapTimeStr.match(/^(\d+):(\d{2})(\.\d+)?$/);
  if (match) {
    const minutes = parseInt(match[1]);
    const seconds = parseFloat(match[2] + (match[3] || ""));
    avgLapSeconds = minutes * 60 + seconds;
  }
  if (avgLapSeconds <= 0) avgLapSeconds = 90;

  // 2. Parse Times to Minutes
  const timeToMinutes = (timeStr: string) => {
    const parts = timeStr.split(":");
    if (parts.length !== 2) return -1;
    const hStr = parts[0];
    const m = parseInt(parts[1]);
    const h = parseInt(hStr);
    if (isNaN(m) || m < 0 || m >= 60) return -1;

    if (hStr === "xx") {
      const startParts = raceStartTime.split(":");
      if (startParts.length !== 2) return -1;
      const startH = parseInt(startParts[0]);
      if (isNaN(startH)) return -1;

      let offset = 0;
      if (
        hStr.startsWith("x") &&
        hStr.length === 2 &&
        !isNaN(Number(hStr[1]))
      ) {
        offset = Number(hStr[1]);
      } else if (hStr.at(1) === "1") offset = 1;

      return (startH + offset) * 60 + m;
    }

    if (isNaN(h) || h < 0 || h >= 24) return -1;
    return h * 60 + m;
  };

  const startMins = timeToMinutes(raceStartTime);
  if (startMins === -1) return [];

  // 3. Map Weather to Lap Numbers
  const points = weather
    .map((w) => {
      const wMins = timeToMinutes(w.time);
      if (wMins === -1) return null;

      let diff = wMins - startMins;
      if (diff < -720) diff += 1440;
      if (diff < -60) return null;

      const lap = diff < 0 ? 0 : Math.floor((diff * 60) / avgLapSeconds);

      const isRedFlag =
        w.condition.toUpperCase().includes("C4") ||
        w.condition.toLowerCase().includes("red flag");

      return { lap, isRedFlag };
    })
    .filter((p): p is { lap: number; isRedFlag: boolean } => p !== null)
    .sort((a, b) => a.lap - b.lap);

  if (points.length === 0) return [];

  // 4. Return lap where red flag happens
  const redFlagLaps: Array<{ lap: number }> = [];
  for (const pt of points) {
    if (pt.isRedFlag) {
      redFlagLaps.push({ lap: pt.lap });
    }
  }

  return redFlagLaps;
};
