import { X } from "lucide-react";
import { useState } from "react";
import { DEFAULT_RACECONFIGURATION } from "./RaceSettings";
import { DEFAULT_PREFERENCES } from "./TyreSettings";
import { Folder, TySession } from "@/app/types/TyTypes";
import { authClient } from "@/lib/auth-client";
import { PlaceIconsMap } from "@/app/types/PlaceIconsMap";
import Image from "next/image";

interface NewSessionProps {
  onClose: () => void;
  onCreate: (session: TySession) => void;
  folders: Folder[];
}

export default function NewSession({
  onClose,
  onCreate,
  folders,
}: NewSessionProps) {
  // 1. Local state for the form inputs
  const [name, setName] = useState("");
  const [folder, setFolder] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [laps, setLaps] = useState("");
  const [icon, setIcon] = useState("default");
  const [iconUrl, setIconUrl] = useState("");
  const [showWarning, setShowWarning] = useState(false);

  const { data: session } = authClient.useSession();
  const user = session?.user;

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

    onCreate(newSession);
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
                onChange={(e) => {
                  setName(e.target.value);
                  setShowWarning(false);
                }}
                placeholder="e.g. FT1 Kubica Island Autodrome"
                className={`h-10 w-full rounded border border-neutral-700 bg-zinc-200 px-2 focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800 ${showWarning && !name ? "border-red-500" : ""}`}
              />

              <select
                name="Folder"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="w-20 appearance-none rounded border border-neutral-700 bg-zinc-200 bg-none text-center focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
              >
                <option value="">—</option>

                {folders
                  .filter((f) =>
                    user ? f.source === "cloud" : f.source === "local",
                  )
                  .map((folder) => (
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
                placeholder="0"
                value={laps}
                min={0}
                max={1000}
                onChange={(e) => {
                  const val = e.target.value;
                  if (
                    val === "" ||
                    (/^\d+$/.test(val) && +val >= 0 && +val <= 1000)
                  ) {
                    setLaps(val);
                  }
                }}
                className="w-32 rounded border border-neutral-700 bg-zinc-200 p-2 focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
              />
              <span className="text-sm">laps</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Thumbnail Icon</label>
            <div className="flex w-full flex-col gap-2 rounded border border-neutral-300 bg-zinc-200 p-2 dark:border-neutral-700 dark:bg-neutral-800">
              <div className="flex flex-row items-center gap-4 overflow-x-auto p-2">
                {Object.entries(PlaceIconsMap).map(([id, place]) => (
                  <div key={id}>
                    <div
                      className={`flex h-28 w-28 shrink-0 cursor-pointer items-center justify-center rounded-lg border-2 bg-neutral-100 dark:bg-neutral-900 ${
                        icon === id ? "border-blue-600" : "border-transparent"
                      }`}
                      onClick={() => setIcon(id)}
                    >
                      <Image
                        src={place.path}
                        alt={place.displayName ?? id}
                        className="h-full w-full rounded-xl object-contain p-2"
                        width={96}
                        height={96}
                      />
                    </div>
                  </div>
                ))}
                <div
                  className={`flex h-28 w-28 shrink-0 cursor-pointer items-center justify-center rounded-lg border-2 bg-neutral-100 dark:bg-neutral-900 ${
                    icon === "custom" ? "border-blue-600" : "border-transparent"
                  }`}
                  onClick={() => setIcon("custom")}
                >
                  {iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={iconUrl}
                      alt="Custom Icon"
                      className="h-full w-full rounded-xl object-cover p-2"
                    />
                  ) : (
                    <span className="text-center text-xs text-neutral-500">
                      Custom URL
                    </span>
                  )}
                </div>
              </div>
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
          onClick={() => {
            if (!name) {
              setShowWarning(true);
              return;
            } else {
              handleCreate();
            }
          }}
          className="mt-2 w-full cursor-pointer rounded-lg bg-neutral-300 py-3 font-bold text-black transition hover:bg-neutral-200"
        >
          Create Session
        </button>
      </div>
    </div>
  );
}
