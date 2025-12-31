import { Folder } from "@/app/types/TyTypes";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Copy, Trash2, X } from "lucide-react";
import { useState } from "react";

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
    <div className="w-full h-full absolute top-0 left-0 bg-neutral-950/95 flex flex-col items-center justify-center p-8 gap-4 z-100">
      <div className="w-full max-w-md bg-zinc-100 dark:bg-neutral-900 rounded-xl p-6 flex flex-col gap-6 border-red-500 border-2 shadow-2xl">
        <h2 className="text-xl font-bold ">Confirm Deletion</h2>
        <hr className="border-neutral-800" />
        <p className="text-red-500 font-light">
          Are you sure you want to delete this session? This action cannot be
          undone.
        </p>

        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-neutral-700  rounded hover:bg-neutral-600 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600  rounded hover:bg-red-700 transition cursor-pointer"
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
  const [folders] = useLocalStorage<Folder[]>("tyrestats_folders", []);

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
      <div className="w-full h-full absolute top-0 left-0 bg-neutral-950/95 flex flex-col items-center justify-center p-8 gap-2 z-50">
        <div className="w-full max-w-md bg-zinc-100 dark:bg-neutral-900 rounded-xl p-6 flex flex-col gap-6 border border-neutral-800 shadow-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold ">Session Settings</h2>
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
                <div className="flex items-center gap-2 grow">
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        name: e.target.value,
                      })
                    }
                    className="bg-zinc-200 dark:bg-neutral-800 border border-neutral-700 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-neutral-600"
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
                  className="bg-zinc-200 dark:bg-neutral-800 border border-neutral-700 rounded p-2  w-full focus:outline-none focus:ring-2 focus:ring-neutral-600"
                />
              </div>
            </div>
            {/* icon selector */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Thumbnail Icon</label>
              <div className="flex items-center gap-2">
                <select
                  name="Thumbnail Icon"
                  className="bg-zinc-200 dark:bg-neutral-800 border border-neutral-700 rounded p-2  w-full focus:outline-none focus:ring-2 focus:ring-neutral-600"
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
                  className="bg-zinc-200 dark:bg-neutral-800 border border-neutral-700 rounded p-2  w-full"
                />
              )}
            </div>
          </div>
          <hr className="border-neutral-800" />
          <div className="flex flex-row gap-2 items-center justify-center">
            <button
              className="text-red-600 flex items-center gap-1 cursor-pointer text-sm hover:underline self-start"
              onClick={() => {
                setShowDeleteConfirm(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Session</span>
            </button>
            <div className="border-l border-neutral-500 h-6 self-center mx-2" />
            <button
              className="flex items-center gap-1 cursor-pointer text-sm hover:underline self-start"
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
            className="w-full bg-neutral-300 text-black font-bold py-3 rounded-lg hover:bg-neutral-200 transition cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      </div>
    </>
  );
}
