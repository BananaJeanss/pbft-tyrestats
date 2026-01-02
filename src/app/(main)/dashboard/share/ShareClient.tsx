"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, Suspense } from "react";
import { TySession, TimelineData, ManualStint } from "@/app/types/TyTypes";
import { generateOptimalTimeline } from "../TyreMath";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import DashboardView from "../components/DashboardView";

function SharedSessionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const shortCode = useMemo(() => {
    const params = Object.keys(Object.fromEntries(searchParams));
    return params.length > 0 ? params[0] : null;
  }, [searchParams]);

  const [sessionData, setSessionData] = useState<TySession | null>(null);
  // Initialize state based on shortCode to avoid synchronous updates in useEffect
  const [loading, setLoading] = useState(!!shortCode);
  const [error, setError] = useState<string | null>(
    !shortCode ? "Invalid link" : null,
  );

  const [isManualMode, setIsManualMode] = useState(false);

  // Track shortCode changes to reset state
  const [prevShortCode, setPrevShortCode] = useState(shortCode);
  if (shortCode !== prevShortCode) {
    setPrevShortCode(shortCode);
    setLoading(!!shortCode);
    setError(!shortCode ? "Invalid link" : null);
    setSessionData(null);
    setIsManualMode(false);
  }

  useEffect(() => {
    let ignore = false;
    if (!shortCode) return;

    fetch(`/api/short?url=${shortCode}`, {
      method: "GET",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Session not found");
        return res.json();
      })
      .then((result) => {
        if (!ignore) {
          if (result.sessionData) {
            setSessionData(result.sessionData);
            if (
              result.sessionData.manualStints &&
              result.sessionData.manualStints.length > 0
            ) {
              setIsManualMode(true);
            }
          } else {
            setError("No session data found");
          }
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error(err);
          setError("Failed to load session");
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [shortCode]);

  // Derived states for components - calculation via useMemo avoids cascading renders
  const timelineResult = useMemo(() => {
    if (!sessionData) return null;

    const { raceConfig, tyrePreferences, tyreData } = sessionData;
    const hasRaceConfig = raceConfig && raceConfig.RaceLaps > 0;
    const hasTyreData = Object.keys(tyreData || {}).length > 0;

    if (hasRaceConfig && hasTyreData) {
      return generateOptimalTimeline(raceConfig, tyrePreferences, tyreData);
    }
    return null;
  }, [sessionData]);

  const autoTimelineData = useMemo(() => {
    return (
      timelineResult?.timelineData || [
        { name: "Strategy", soft: 0, medium: 0, hard: 0, wet: 0 },
      ]
    );
  }, [timelineResult]);

  const autoTimelineStints = useMemo(() => {
    return timelineResult?.timelineStints || [];
  }, [timelineResult]);

  const timelineGenerated = !!timelineResult;

  // Manual Timeline Data Helpers
  const manualTimelineData = useMemo(() => {
    if (!sessionData?.manualStints || sessionData.manualStints.length === 0)
      return [{ name: "Strategy", soft: 0, medium: 0, hard: 0, wet: 0 }];

    const dataRow: TimelineData = { name: "Strategy" };
    sessionData.manualStints.forEach((stint: ManualStint, index: number) => {
      dataRow[`manual_${index}_${stint.tyre}`] = stint.laps;
    });
    return [dataRow];
  }, [sessionData]);

  const manualTimelineStintsDef = useMemo(() => {
    if (!sessionData?.manualStints) return [];
    const colors: Record<string, string> = {
      soft: "#dc2626",
      medium: "#eab308",
      hard: "#ffffff",
      wet: "#1d4ed8",
    };
    const labels: Record<string, string> = {
      soft: "S",
      medium: "M",
      hard: "H",
      wet: "W",
    };

    return sessionData.manualStints.map(
      (stint: ManualStint, index: number) => ({
        tyreId: stint.tyre,
        key: `manual_${index}_${stint.tyre}`,
        color: colors[stint.tyre],
        label: `${labels[stint.tyre]} (${stint.laps}L)`,
      }),
    );
  }, [sessionData]);

  const handleCopySession = () => {
    if (!sessionData) return;

    try {
      const newId = crypto.randomUUID();
      // Create new session object
      const newSession = {
        ...sessionData,
        id: newId,
        meta: {
          ...sessionData.meta,
          name: `Copy of ${sessionData.meta.name}`,
          lastModified: new Date().toISOString(),
        },
        shortUrl: "", // clear short url
      };

      // Save to LocalStorage
      const existing = JSON.parse(
        localStorage.getItem("tyrestats_sessions") || "[]",
      );
      localStorage.setItem(
        "tyrestats_sessions",
        JSON.stringify([...existing, newSession]),
      );

      // Dispatch event so other tabs/components update if needed
      window.dispatchEvent(new Event("local-storage"));

      toast.success("Session imported successfully!");
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
      toast.error("Failed to import session");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-2 bg-zinc-100 text-neutral-500 dark:bg-neutral-950">
        <Loader2 className="animate-spin" size={32} />
        <p>Loading shared session...</p>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-2 bg-zinc-100 text-red-500 dark:bg-neutral-950">
        <AlertCircle size={32} />
        <p>{error || "Session not found"}</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 rounded bg-neutral-200 px-4 py-2 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)] bg-zinc-100 p-8 dark:bg-neutral-950">
      <div className="h-full w-full rounded-lg bg-zinc-200 p-4 dark:bg-neutral-900">
        <DashboardView
          sessionName={sessionData.meta.name}
          readOnly={true}
          SessionData={sessionData}
          timelineGenerated={
            isManualMode
              ? (sessionData.manualStints?.length ?? 0) > 0
              : timelineGenerated
          }
          autoTimelineData={autoTimelineData}
          autoTimelineStints={autoTimelineStints}
          manualTimelineData={manualTimelineData}
          manualTimelineStintsDef={manualTimelineStintsDef}
          isManualMode={isManualMode}
          // Actions (no-ops for read-only where not applicable)
          setRaceSettingsVis={() => {}}
          settyremanVis={() => {}}
          setSelectedTyre={() => {}}
          setTyrePreferences={() => {}}
          setCurrentNotes={() => {}}
          setCurrentSuggestion={() => {}}
          setAIConfigSettings={() => {}}
          setWeather={() => {}}
          setMiscStats={() => {}}
          setIsManualMode={setIsManualMode}
          onCopySession={handleCopySession}
          onClearTyreData={() => {}}
        />
      </div>
    </div>
  );
}

export default function SharedSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full flex-col items-center justify-center gap-2 bg-zinc-100 text-neutral-500 dark:bg-neutral-950">
          <Loader2 className="animate-spin" size={32} />
          <p>Loading shared session...</p>
        </div>
      }
    >
      <SharedSessionContent />
    </Suspense>
  );
}
