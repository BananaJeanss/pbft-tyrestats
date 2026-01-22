import { useState, useMemo } from "react";
import {
  Check,
  X,
  Loader2,
  AlertCircle,
  Folder,
  FileText,
  UploadCloud,
} from "lucide-react";
import { useSessionManager } from "@/hooks/useSessionManager";
import { toast } from "react-toastify";

interface MoveToCloudModalProps {
  onClose: () => void;
}

export default function MoveToCloudModal({ onClose }: MoveToCloudModalProps) {
  const { sessions, localFolders, cloudFolders, clearLocalData, user } =
    useSessionManager();

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress] = useState(0);
  const [completed] = useState(false);

  // Identify Local Items
  const localSessions = useMemo(
    () => sessions.filter((s) => s.source === "local"),
    [sessions],
  );

  // Identify Cloud IDs for collision detection
  const cloudSessionIds = useMemo(
    () =>
      new Set(sessions.filter((s) => s.source === "cloud").map((s) => s.id)),
    [sessions],
  );
  const cloudFolderIds = useMemo(
    () => new Set(cloudFolders.map((f) => f.id)),
    [cloudFolders],
  );

  // Calculate items to move vs skip
  const sessionsToMove = useMemo(
    () => localSessions.filter((s) => !cloudSessionIds.has(s.id)),
    [localSessions, cloudSessionIds],
  );
  const sessionsSkipped = useMemo(
    () => localSessions.filter((s) => cloudSessionIds.has(s.id)),
    [localSessions, cloudSessionIds],
  );

  const foldersToMove = useMemo(
    () => localFolders.filter((f) => !cloudFolderIds.has(f.id)),
    [localFolders, cloudFolderIds],
  );
  const foldersSkipped = useMemo(
    () => localFolders.filter((f) => cloudFolderIds.has(f.id)),
    [localFolders, cloudFolderIds],
  );

  const totalItemsToMove = sessionsToMove.length + foldersToMove.length;
  const totalSkipped = sessionsSkipped.length + foldersSkipped.length;

  const handleMove = async () => {
    if (!user) {
      toast.error("You must be logged in.");
      return;
    }

    if (totalItemsToMove === 0) {
      toast.info("No new items to move.");
      if (totalSkipped > 0) {
        if (
          confirm("All local items already exist in cloud. Clear local data?")
        ) {
          clearLocalData();
          toast.success("Local data cleared.");
          onClose();
        }
      }
      return;
    }

    setIsProcessing(true);

    try {
      const payload = {
        sessions: sessionsToMove,
        folders: foldersToMove,
      };

      const res = await fetch("/api/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Migration failed");
      }

      clearLocalData();

      // Force reload to ensure fresh state from cloud
      window.location.reload();
    } catch (e) {
      console.error(e);
      toast.error("An error occurred during migration.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="absolute top-0 left-0 z-150 flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-950/95 p-8">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-xl border-2 border-neutral-800 bg-zinc-100 p-6 shadow-2xl dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <UploadCloud /> Move to Cloud
          </h2>
          {!isProcessing && (
            <button onClick={onClose} className="cursor-pointer">
              <X />
            </button>
          )}
        </div>
        <hr className="border-neutral-800" />

        {completed ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <Check size={32} />
            </div>
            <h3 className="text-lg font-semibold">Success!</h3>
            <p className="text-neutral-500">
              Your local data has been moved to the cloud.
            </p>
            <button
              onClick={onClose}
              className="mt-2 w-full cursor-pointer rounded-lg bg-neutral-200 px-4 py-2 font-semibold transition hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-neutral-500">
                This will move your local sessions and folders to your cloud
                account. Once uploaded, they will be removed from this device.
              </p>

              <div className="flex flex-col gap-2 rounded-lg bg-neutral-200 p-4 dark:bg-neutral-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <FileText size={16} /> Sessions to Move
                  </span>
                  <span className="font-mono font-bold">
                    {sessionsToMove.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Folder size={16} /> Folders to Move
                  </span>
                  <span className="font-mono font-bold">
                    {foldersToMove.length}
                  </span>
                </div>
                {totalSkipped > 0 && (
                  <>
                    <hr className="my-1 border-neutral-700/50" />
                    <div className="flex items-center justify-between text-sm text-yellow-600 dark:text-yellow-500">
                      <span className="flex items-center gap-2">
                        <AlertCircle size={16} /> Skipped (Exists)
                      </span>
                      <span className="font-mono font-bold">
                        {totalSkipped}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {isProcessing && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>Moving...</span>
                    <span>
                      {Math.round((progress / totalItemsToMove) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                    <div
                      className="h-full bg-(--tyrestats-blue) transition-all duration-300"
                      style={{
                        width: `${(progress / totalItemsToMove) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-2">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="cursor-pointer rounded-lg bg-zinc-300 px-4 py-2 font-semibold transition hover:bg-zinc-400 disabled:opacity-50 dark:bg-neutral-700 dark:hover:bg-neutral-600"
              >
                Cancel
              </button>
              <button
                onClick={handleMove}
                disabled={isProcessing || totalItemsToMove === 0}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-(--tyrestats-blue) px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing && <Loader2 size={16} className="animate-spin" />}
                {isProcessing ? "Moving..." : "Start Move"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
