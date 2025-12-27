import { X } from "lucide-react";
import { useState } from "react";
import { useLocalStorage } from "../../../../hooks/useLocalStorage";
import { DEFAULT_RACECONFIGURATION } from "./RaceSettings";
import { DEFAULT_PREFERENCES } from "./TyreSettings";
import { Folder, TySession } from "@/app/types/TyTypes";

interface NewSessionProps {
  onClose: () => void;
}

export default function NewSession({ onClose }: NewSessionProps) {
  // 1. Local state for the form inputs
  const [name, setName] = useState("");
  const [folder, setFolder] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [laps, setLaps] = useState("");
  const [icon, setIcon] = useState("default");
  const [iconUrl, setIconUrl] = useState("");

  // 2. Access the global sessions list from LocalStorage
  const [sessions, setSessions] = useLocalStorage<TySession[]>(
    "tyrestats_sessions",
    [],
  );
  const [folders] = useLocalStorage<Folder[]>("tyrestats_folders", []);

  const handleCreate = () => {
    if (!name) return; // Basic validation

    const newSession: TySession = {
      id: crypto.randomUUID(),
      folder: folder || null,
      meta: {
        name,
        date,
        selectedIcon: icon,
        icon_url: iconUrl,
        lastModified: new Date().toISOString(),
      },
      raceConfig: {
        ...DEFAULT_RACECONFIGURATION,
        RaceLaps: parseInt(laps) || 0,
      },
      tyrePreferences: DEFAULT_PREFERENCES,
      tyreData: {},
      manualStints: [],
      aiConfigSettings: {
        model: "qwen/qwen3-32b",
        temperature: 0.7,
        top_p: 1,
        useExperimentalPrompt: false,
      },
    };

    // 3. Save to LocalStorage
    setSessions([...sessions, newSession]);
    onClose();
  };

  return (
    <div className="w-full h-full absolute top-0 left-0 bg-neutral-950/95 flex flex-col items-center justify-center p-8 gap-2 z-50">
      <div className="w-full max-w-md bg-zinc-100 dark:bg-neutral-900 rounded-xl p-6 flex flex-col gap-6 border border-neutral-800 shadow-2xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold ">New Session</h2>
          <button onClick={onClose} className=" cursor-pointer">
            <X />
          </button>
        </div>

        <hr className="border-neutral-800" />

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Session Name</label>
            <div className="flex flex-row gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. FT1 Kubica Island Autodrome"
                className="h-10 w-full bg-zinc-200 dark:bg-neutral-800 border border-neutral-700 rounded px-2 focus:outline-none focus:ring-2 focus:ring-neutral-600"
              />

              <select
                name="Folder"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="bg-none appearance-none w-20 bg-zinc-200 dark:bg-neutral-800 border border-neutral-700 rounded focus:outline-none focus:ring-2 focus:ring-neutral-600 text-center"
              >
                <option value="">—</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold ">Date</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-zinc-200 dark:bg-neutral-800 border border-neutral-700 rounded p-2  w-full focus:outline-none focus:ring-2 focus:ring-neutral-600"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold ">Race Laps</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={laps}
                onChange={(e) => setLaps(e.target.value)}
                className="bg-zinc-200 dark:bg-neutral-800 border border-neutral-700 rounded p-2  w-32 focus:outline-none focus:ring-2 focus:ring-neutral-600"
              />
              <span className=" text-sm">laps</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold ">Thumbnail Icon</label>
            <div className="flex items-center gap-2">
              <select
                name="Thumbnail Icon"
                className="bg-zinc-200 dark:bg-neutral-800 border border-neutral-700 rounded p-2  w-full focus:outline-none focus:ring-2 focus:ring-neutral-600"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
              >
                <option value="default">Default (Placeholder)</option>
                <option value="kubica">Kubica Island Autodrome</option>
                <option value="petgear">PET Gear Autodrome</option>
                <option value="harju">Harju Superovaal</option>
                <option value="panther">Panther Hügel Rennstrecke</option>
                <option value="custom">Custom (Image URL)</option>
              </select>
            </div>
            {icon === "custom" && (
              <input
                type="text"
                placeholder="Image URL"
                value={iconUrl ?? ""}
                onChange={(e) => {
                  setIconUrl(e.target.value);
                }}
                className="bg-zinc-200 dark:bg-neutral-800 border border-neutral-700 rounded p-2  w-full"
              />
            )}
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
