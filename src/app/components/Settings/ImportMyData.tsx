import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ClipboardCopyIcon, ImportIcon, TriangleAlert, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

export interface ImportMyDataProps {
  onClose: () => void;
}

export default function ImportMyData({ onClose }: ImportMyDataProps) {
  const [importData, setImportData] = useState<string>("");
  const [_, setSessions] = useLocalStorage<any[]>("tyrestats_sessions", []);

  function isValidSession(session: any): boolean {
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
        "Failed to import data. Please ensure the format is correct."
      );
      console.error(err);
    }
  };

  return (
    <div className="w-full h-full absolute top-0 left-0 bg-neutral-950/95 flex flex-col items-center justify-center p-8 gap-2 z-150">
      <div className="w-full max-w-2xl bg-neutral-900 rounded-xl p-6 flex flex-col gap-4 border border-neutral-800 shadow-2xl">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Import Data</h2>
            <X onClick={onClose} className="text-neutral-400 cursor-pointer" />
          </div>
          <span className="text-yellow-500 flex flex-row items-center text-sm gap-2">
            <TriangleAlert />
            This will overwrite ALL data you have saved. Proceed with caution.
          </span>
        </div>
        <textarea
          className="w-full max-w-3xl h-96 bg-neutral-900 text-white p-4 rounded-lg border border-neutral-800 resize-none"
          value={importData}
          onChange={(e) => setImportData(e.target.value)}
          placeholder="Paste your exported data here..."
        />
        <button
          className="border border-orange-500 flex flex-row p-2 items-center bg-transparent text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition w-fit gap-2 text-md font-semibold cursor-pointer"
          onClick={ImportThisData}
        >
          <ImportIcon />
          Import Data
        </button>
      </div>
    </div>
  );
}
