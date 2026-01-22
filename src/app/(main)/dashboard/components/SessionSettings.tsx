import { Copy, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Folder } from "@/app/types/TyTypes";

export interface SessionSettings {
  name: string;
  date: string;
  folder: string | null;
  lastModified: string;
  selectedIcon: string;
  icon_url?: string;
}

interface SessionSettingsProps {
  currentConfig?: SessionSettings;
  onClose: () => void;
  onSave: (prefs: SessionSettings) => void;
  DeleteThisSession: () => void;
  DuplicateThisSession: () => void;
  folders: (Folder & { source?: "local" | "cloud" })[];
  source?: "local" | "cloud";
}

function DeleteConfirmationScreen({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    /* delete session confimration screen */
    <div className="absolute top-0 left-0 z-100 flex h-full w-full flex-col items-center justify-center gap-4 bg-neutral-950/95 p-8">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-xl border-2 border-red-500 bg-zinc-100 p-6 shadow-2xl dark:bg-neutral-900">
        <h2 className="text-xl font-bold">Confirm Deletion</h2>
        <hr className="border-neutral-800" />
        <p className="font-light text-red-500">
          Are you sure you want to delete this session? This action cannot be
          undone.
        </p>

        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="cursor-pointer rounded bg-neutral-700 px-4 py-2 transition hover:bg-neutral-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="cursor-pointer rounded bg-red-600 px-4 py-2 transition hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SessionSettingsPage({
  currentConfig,
  onClose,
  onSave,
  DeleteThisSession,
  DuplicateThisSession,
  folders,
  source,
}: SessionSettingsProps) {
  const [config, setConfig] = useState<SessionSettings>(
    currentConfig || {
      name: "New Session",
      folder: null,
      date: new Date().toISOString().split("T")[0],
      lastModified: new Date().toISOString(),
      selectedIcon: "default",
      icon_url: "",
    },
  );

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // only show folders that match the source of the session
  const validFolders = folders.filter((f) => !source || !f.source || f.source === source);

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  return (
    <>
      {showDeleteConfirm && (
        <DeleteConfirmationScreen
          onConfirm={() => {
            DeleteThisSession();
            setShowDeleteConfirm(false);
            onClose();
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
      <div className="absolute top-0 left-0 z-50 flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-950/95 p-8">
        <div className="flex w-full max-w-md flex-col gap-6 rounded-xl border border-neutral-800 bg-zinc-100 p-6 shadow-2xl dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Session Settings</h2>
            <button onClick={onClose} className="cursor-pointer">
              <X />
            </button>
          </div>

          <hr className="border-neutral-800" />

          <div className="flex flex-col gap-6">
            {/* session name */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Session Name</label>
              <div className="flex flex-row gap-2">
                <div className="flex grow items-center gap-2">
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        name: e.target.value,
                      })
                    }
                    className="w-full rounded border border-neutral-700 bg-zinc-200 p-2 focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
                  />
                </div>
                <select
                  name="Folder"
                  value={config.folder ?? ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      folder: e.target.value,
                    })
                  }
                  className="w-20 appearance-none rounded border border-neutral-700 bg-zinc-200 bg-none text-center focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
                >
                  <option value="">—</option>
                  {validFolders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* date selector */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Session Date</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={config.date}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      date: e.target.value,
                    })
                  }
                  className="w-full rounded border border-neutral-700 bg-zinc-200 p-2 focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
                />
              </div>
            </div>
            {/* icon selector */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Thumbnail Icon</label>
              <div className="flex items-center gap-2">
                <select
                  name="Thumbnail Icon"
                  className="w-full rounded border border-neutral-700 bg-zinc-200 p-2 focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
                  value={config.selectedIcon}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      selectedIcon: e.target.value,
                    })
                  }
                >
                  <option value="default">Default (Placeholder)</option>
                  <option value="kubica">Kubica Island Autodrome</option>
                  <option value="petgear">PET Gear Autodrome</option>
                  <option value="harju">Harju Superovaal</option>
                  <option value="panther">Panther Hügel Rennstrecke</option>
                  <option value="custom">Custom (Image URL)</option>
                </select>
              </div>
              {config.selectedIcon === "custom" && (
                <input
                  type="text"
                  placeholder="Image URL"
                  value={config.icon_url ?? ""}
                  onChange={(e) =>
                    setConfig({ ...config, icon_url: e.target.value })
                  }
                  className="w-full rounded border border-neutral-700 bg-zinc-200 p-2 dark:bg-neutral-800"
                />
              )}
            </div>
          </div>
          <hr className="border-neutral-800" />
          <div className="flex flex-row items-center justify-center gap-2">
            <button
              className="flex cursor-pointer items-center gap-1 self-start text-sm text-red-600 hover:underline"
              onClick={() => {
                setShowDeleteConfirm(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Session</span>
            </button>
            <div className="mx-2 h-6 self-center border-l border-neutral-500" />
            <button
              className="flex cursor-pointer items-center gap-1 self-start text-sm hover:underline"
              onClick={() => {
                DuplicateThisSession();
              }}
            >
              <Copy className="h-4 w-4" />
              <span>Duplicate Session</span>
            </button>
          </div>
          <hr className="border-neutral-800" />
          <button
            onClick={handleSave}
            className="w-full cursor-pointer rounded-lg bg-neutral-300 py-3 font-bold text-black transition hover:bg-neutral-200"
          >
            Save Settings
          </button>
        </div>
      </div>
    </>
  );
}
