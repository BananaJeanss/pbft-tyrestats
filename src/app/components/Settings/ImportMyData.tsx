import { TySession } from "@/app/types/TyTypes";
import { ImportIcon, TriangleAlert, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

export interface ImportMyDataProps {
  onClose: () => void;
}

export default function ImportMyData({ onClose }: ImportMyDataProps) {
  const [importData, setImportData] = useState<string>("");

  function isValidSession(session: TySession): boolean {
    return (
      typeof session === "object" &&
      typeof session.id === "string" &&
      typeof session.meta?.name === "string" &&
      typeof session.meta?.date === "string" &&
      typeof session.raceConfig?.RaceLaps === "number"
    );
  }

  const ImportThisData = () => {
    try {
      const parsedData = JSON.parse(importData);

      const rawSessions = parsedData["tyrestats_sessions"];
      let normalizedSessions = rawSessions;

      if (typeof rawSessions === "string") {
        normalizedSessions = JSON.parse(rawSessions);
      }

      if (
        !Array.isArray(normalizedSessions) ||
        !normalizedSessions.every(isValidSession)
      ) {
        throw new Error("Invalid session data");
      }

      for (const [key, value] of Object.entries(parsedData)) {
        let finalValue = value;

        if (key === "tyrestats_sessions") {
          finalValue = normalizedSessions;
        } else if (typeof value === "string") {
          try {
            finalValue = JSON.parse(value);
          } catch {}
        }

        localStorage.setItem(key, JSON.stringify(finalValue));
      }

      toast.success("Data imported successfully!");
      window.dispatchEvent(new Event("local-storage"));
      onClose();
    } catch (err) {
      toast.error(
        "Failed to import data. Please ensure the format is correct.",
      );
      console.error(err);
    }
  };

  return (
    <div className="absolute top-0 left-0 z-150 flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-950/95 p-8">
      <div className="flex w-full max-w-2xl flex-col gap-4 rounded-xl border border-neutral-800 bg-zinc-100 p-6 shadow-2xl dark:bg-neutral-900">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Import Data</h2>
            <X onClick={onClose} className="cursor-pointer" />
          </div>
          <span className="flex flex-row items-center gap-2 text-sm text-yellow-500">
            <TriangleAlert />
            This will overwrite ALL data you have saved. Proceed with caution.
          </span>
        </div>
        <textarea
          className="h-96 w-full max-w-3xl resize-none rounded-lg border border-neutral-800 bg-zinc-200 p-4 dark:bg-neutral-900"
          value={importData}
          onChange={(e) => setImportData(e.target.value)}
          placeholder="Paste your exported data here..."
        />
        <button
          className="hover: text-md flex w-fit cursor-pointer flex-row items-center gap-2 rounded-lg border border-orange-500 bg-transparent p-2 font-semibold text-orange-500 transition hover:bg-orange-800"
          onClick={ImportThisData}
        >
          <ImportIcon />
          Import Data
        </button>
      </div>
    </div>
  );
}
