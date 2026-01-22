import { useState, useEffect, useCallback } from "react";
import { Folder, TySession } from "@/app/types/TyTypes";
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
  const [localFolders, setLocalFolders] = useLocalStorage<Folder[]>(
    "tyrestats_folders",
    [],
  );

  // Cloud Storage State
  const [cloudSessions, setCloudSessions] = useState<TySession[]>([]);
  const [cloudFolders, setCloudFolders] = useState<Folder[]>([]);
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

  // Fetch Cloud Folders on Mount/Login
  useEffect(() => {
    if (!user) {
      setCloudFolders([]);
      return;
    }

    const fetchCloudFolders = async () => {
      try {
        const res = await fetch("/api/folder");
        if (res.ok) {
          const data = await res.json();
          const { folders } = data;
          if (Array.isArray(folders)) {
            setCloudFolders(folders);
          }
        }
      } catch (error) {
        console.error("Failed to fetch cloud folders", error);
        toast.error("Failed to sync cloud folders");
      }
    };

    fetchCloudFolders();
  }, [user]);

  // Combined Sessions for UI
  const sessions: ExtendedSession[] = [
    ...localSessions.map((s) => ({ ...s, source: "local" as const })),
    ...cloudSessions.map((s) => ({ ...s, source: "cloud" as const })),
  ];

  // save session to local or cloud
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

  // delete session from local or cloud
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

  // move localstorage session to cloud sessions
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

  // save folder to local or cloud
  const saveFolder = useCallback(
    async (folderData: Folder, source: SessionSource) => {
      if (source === "local") {
        setLocalFolders((prev) => {
          const exists = prev.find((f) => f.id === folderData.id);
          if (exists) {
            return prev.map((f) => (f.id === folderData.id ? folderData : f));
          } else {
            return [...prev, folderData];
          }
        });
      } else {
        setCloudFolders((prev) => {
          const exists = prev.find((f) => f.id === folderData.id);
          if (exists) {
            return prev.map((f) => (f.id === folderData.id ? folderData : f));
          } else {
            return [...prev, folderData];
          }
        });
        try {
          const res = await fetch("/api/folder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(folderData),
          });

          if (!res.ok) throw new Error("Cloud folder save failed");
        } catch (error) {
          console.error(error);
          toast.error("Failed to save folder to cloud");
        }
      }
    },
    [setLocalFolders],
  );

  // delete folder from local or cloud
  const deleteFolder = useCallback(
    async (folderId: string, source: SessionSource) => {
      if (source === "local") {
        setLocalFolders((prev) => prev.filter((f) => f.id !== folderId));
      } else {
        setCloudFolders((prev) => prev.filter((f) => f.id !== folderId));
      }
    },
    [setLocalFolders],
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

  const createNewFolder = useCallback(
    (folderData: Folder) => {
      if (user) {
        setCloudFolders((prev) => [...prev, folderData]);
      } else {
        setLocalFolders((prev) => [...prev, folderData]);
      }
    },
    [user, setLocalFolders],
  );

  const clearLocalData = useCallback(() => {
    setLocalSessions([]);
    setLocalFolders([]);
  }, [setLocalSessions, setLocalFolders]);

  // Combined Folders for UI
  const folders = [
      ...localFolders.map(f => ({ ...f, source: "local" as const })),
      ...cloudFolders.map(f => ({ ...f, source: "cloud" as const }))
  ];

  return {
    sessions,
    folders,
    isCloudLoading,
    saveSession,
    deleteSession,
    moveToCloud,
    createNewSession,
    createNewFolder,
    saveFolder,
    deleteFolder,
    localFolders,
    cloudFolders,
    clearLocalData,
    user,
  };
}
