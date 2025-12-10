import { X } from "lucide-react";
import { useState } from "react";
import { useLocalStorage } from "../../../../hooks/useLocalStorage";
import { DEFAULT_RACECONFIGURATION } from "./RaceSettings";
import { DEFAULT_PREFERENCES } from "./TyreSettings";

interface NewSessionProps {
  onClose: () => void;
}

export default function NewSession({ onClose }: NewSessionProps) {
  // 1. Local state for the form inputs
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [laps, setLaps] = useState("");

  // 2. Access the global sessions list from LocalStorage
  const [sessions, setSessions] = useLocalStorage<any[]>(
    "tyrestats_sessions",
    []
  );

  const handleCreate = () => {
    if (!name) return; // Basic validation

    const newSession = {
      id: crypto.randomUUID(),
      meta: {
        name,
        date,
        lastModified: new Date().toISOString(),
      },
      raceConfig: {
        ...DEFAULT_RACECONFIGURATION,
        RaceLaps: parseInt(laps) || 0,
      },
      tyrePreferences: DEFAULT_PREFERENCES,
      tyreData: {},
    };

    // 3. Save to LocalStorage
    setSessions([...sessions, newSession]);
    onClose();
  };

  return (
    <div className="w-full h-full absolute top-0 left-0 bg-neutral-950/95 flex flex-col items-center justify-center p-8 gap-2 z-50">
      <div className="w-full max-w-md bg-neutral-900 rounded-xl p-6 flex flex-col gap-6 border border-neutral-800 shadow-2xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">New Session</h2>
          <button onClick={onClose} className="text-neutral-400 cursor-pointer">
            <X />
          </button>
        </div>

        <hr className="border-neutral-800" />

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-neutral-300">
              Session Name
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. FT1 Kubica Island Autodrome"
                className="bg-neutral-800 border border-neutral-700 rounded p-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-neutral-600"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-neutral-300">
              Date
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-neutral-800 border border-neutral-700 rounded p-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-neutral-600"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-neutral-300">
              Race Laps
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={laps}
                onChange={(e) => setLaps(e.target.value)}
                className="bg-neutral-800 border border-neutral-700 rounded p-2 text-white w-32 focus:outline-none focus:ring-2 focus:ring-neutral-600"
              />
              <span className="text-neutral-500 text-sm">laps</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="w-full bg-neutral-300 text-black font-bold py-3 rounded-lg hover:bg-neutral-200 transition mt-2 cursor-pointer"
        >
          Create Session
        </button>
      </div>
    </div>
  );
}
