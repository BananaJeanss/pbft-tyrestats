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
    <div className="absolute top-0 left-0 z-50 flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-950/95 p-8">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-xl border border-neutral-800 bg-zinc-100 p-6 shadow-2xl dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">New Session</h2>
          <button onClick={onClose} className="cursor-pointer">
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
                className="h-10 w-full rounded border border-neutral-700 bg-zinc-200 px-2 focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
              />

              <select
                name="Folder"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="w-20 appearance-none rounded border border-neutral-700 bg-zinc-200 bg-none text-center focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
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
            <label className="text-sm font-semibold">Date</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded border border-neutral-700 bg-zinc-200 p-2 focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Race Laps</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={laps}
                onChange={(e) => setLaps(e.target.value)}
                className="w-32 rounded border border-neutral-700 bg-zinc-200 p-2 focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
              />
              <span className="text-sm">laps</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Thumbnail Icon</label>
            <div className="flex items-center gap-2">
              <select
                name="Thumbnail Icon"
                className="w-full rounded border border-neutral-700 bg-zinc-200 p-2 focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
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
                className="w-full rounded border border-neutral-700 bg-zinc-200 p-2 dark:bg-neutral-800"
              />
            )}
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="mt-2 w-full cursor-pointer rounded-lg bg-neutral-300 py-3 font-bold text-black transition hover:bg-neutral-200"
        >
          Create Session
        </button>
      </div>
    </div>
  );
}
