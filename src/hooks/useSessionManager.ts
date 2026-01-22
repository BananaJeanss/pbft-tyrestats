import { useState, useEffect, useCallback } from "react";
import { TySession } from "@/app/types/TyTypes";
import { toast } from "react-toastify";
import { useLocalStorage } from "./useLocalStorage";
import { authClient } from "@/lib/auth-client";

type SessionSource = "local" | "cloud";

export interface ExtendedSession extends TySession {
  source: SessionSource;
}

export function useSessionManager() {
  // Local Storage
  const [localSessions, setLocalSessions] = useLocalStorage<TySession[]>(
    "tyrestats_sessions",
    [],
  );

  // Cloud Storage State
  const [cloudSessions, setCloudSessions] = useState<TySession[]>([]);
  const [isCloudLoading, setIsCloudLoading] = useState(false);

  const { data: session } = authClient.useSession();
  const user = session?.user;

  // Fetch Cloud Sessions on Mount/Login
  useEffect(() => {
    if (!user) {
      setCloudSessions([]);
      return;
    }

    const fetchCloudSessions = async () => {
      setIsCloudLoading(true);
      try {
        const res = await fetch("/api/session");
        if (res.ok) {
          const data = await res.json();

          const { sessions: summaries } = data;
          if (Array.isArray(summaries)) {
            const fullSessions = await Promise.all(
              summaries.map(async (s: { id: string }) => {
                const detailRes = await fetch(`/api/session?id=${s.id}`);
                if (detailRes.ok) return detailRes.json();
                return null;
              }),
            );
            setCloudSessions(
              fullSessions.filter((s): s is TySession => s !== null),
            );
          }
        }
      } catch (error) {
        console.error("Failed to fetch cloud sessions", error);
        toast.error("Failed to sync cloud sessions");
      } finally {
        setIsCloudLoading(false);
      }
    };

    fetchCloudSessions();
  }, [user]);

  // Combined Sessions for UI
  const sessions: ExtendedSession[] = [
    ...localSessions.map((s) => ({ ...s, source: "local" as const })),
    ...cloudSessions.map((s) => ({ ...s, source: "cloud" as const })),
  ];

  const saveSession = useCallback(
    async (sessionData: TySession, source: SessionSource) => {
      if (source === "local") {
        setLocalSessions((prev) => {
          const exists = prev.find((s) => s.id === sessionData.id);
          if (exists) {
            return prev.map((s) => (s.id === sessionData.id ? sessionData : s));
          } else {
            return [...prev, sessionData];
          }
        });
        // toast handled by caller usually, or here
      } else {
        // Cloud Save
        try {
          // Optimistic Update
          setCloudSessions((prev) => {
            const exists = prev.find((s) => s.id === sessionData.id);
            if (exists) {
              return prev.map((s) =>
                s.id === sessionData.id ? sessionData : s,
              );
            }
            return [...prev, sessionData];
          });

          const res = await fetch("/api/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sessionData),
          });

          if (!res.ok) throw new Error("Cloud save failed");
        } catch (error) {
          console.error(error);
          toast.error("Failed to save to cloud");
          // Revert optimistic update if needed (complex)
        }
      }
    },
    [setLocalSessions],
  );

  const deleteSession = useCallback(
    async (sessionId: string, source: SessionSource) => {
      if (source === "local") {
        setLocalSessions((prev) => prev.filter((s) => s.id !== sessionId));
      } else {
        setCloudSessions((prev) => prev.filter((s) => s.id !== sessionId));
        await fetch(`/api/session?id=${sessionId}`, { method: "DELETE" });
      }
    },
    [setLocalSessions],
  );

  const moveToCloud = useCallback(
    async (sessionData: TySession) => {
      if (!user) {
        toast.error("You must be logged in to use Cloud Storage");
        return;
      }

      const toastId = toast.loading("Moving to cloud...");

      try {
        // 1. Save to Cloud
        const res = await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sessionData),
        });

        if (!res.ok) throw new Error("Upload failed");

        // 2. Add to Cloud State
        setCloudSessions((prev) => [...prev, sessionData]);

        // 3. Remove from Local Storage
        setLocalSessions((prev) => prev.filter((s) => s.id !== sessionData.id));

        toast.update(toastId, {
          render: "Moved to cloud!",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        return true;
      } catch (error) {
        console.error(error);
        toast.update(toastId, {
          render: "Failed to move session",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return false;
      }
    },
    [user, setLocalSessions],
  );

  const createNewSession = useCallback(
    (initialData: TySession) => {
      // New sessions are Cloud if logged in, Local otherwise.
      if (user) {
        setCloudSessions((prev) => [...prev, initialData]);
        // Trigger initial save
        saveSession(initialData, "cloud");
      } else {
        setLocalSessions((prev) => [...prev, initialData]);
      }
    },
    [user, setLocalSessions, saveSession],
  );

  return {
    sessions,
    isCloudLoading,
    saveSession,
    deleteSession,
    moveToCloud,
    createNewSession,
    user,
  };
}
