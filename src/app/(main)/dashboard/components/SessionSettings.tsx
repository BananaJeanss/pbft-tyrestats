import { Copy, Trash2, X } from "lucide-react";
import { useState } from "react";

export interface SessionSettings {
  name: string;
  date: string;
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
    <div className="w-full h-full absolute top-0 left-0 bg-neutral-950/95 flex flex-col items-center justify-center p-8 gap-4 z-100">
      <div className="w-full max-w-md bg-neutral-900 rounded-xl p-6 flex flex-col gap-6 border border-neutral-800 shadow-2xl">
        <h2 className="text-xl font-bold text-white">Confirm Deletion</h2>
        <hr className="border-neutral-800" />
        <p className="text-neutral-300">
          Are you sure you want to delete this session? This action cannot be
          undone.
        </p>

        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-neutral-700 text-white rounded hover:bg-neutral-600 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition cursor-pointer"
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
      date: new Date().toISOString().split("T")[0],

      lastModified: new Date().toISOString(),
      selectedIcon: "default",
      icon_url: "",
    }
  );

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        <div className="w-full max-w-md bg-neutral-900 rounded-xl p-6 flex flex-col gap-6 border border-neutral-800 shadow-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Session Settings</h2>
            <button
              onClick={onClose}
              className="text-neutral-400 cursor-pointer"
            >
              <X />
            </button>
          </div>

          <hr className="border-neutral-800" />

          <div className="flex flex-col gap-6">
            {/* session name */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-neutral-300">
                Session Name
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      name: e.target.value,
                    })
                  }
                  className="bg-neutral-800 border border-neutral-700 rounded p-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-neutral-600"
                />
              </div>
            </div>
            {/* date selector */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-neutral-300">
                Session Date
              </label>
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
                  className="bg-neutral-800 border border-neutral-700 rounded p-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-neutral-600"
                />
              </div>
            </div>
            {/* icon selector */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-neutral-300">
                Thumbnail Icon
              </label>
              <div className="flex items-center gap-2">
                <select
                  name="Thumbnail Icon"
                  className="bg-neutral-800 border border-neutral-700 rounded p-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-neutral-600"
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
                  className="bg-neutral-800 border border-neutral-700 rounded p-2 text-white w-full"
                />
              )}
            </div>
          </div>
          <hr className="border-neutral-800" />
          <div className="flex flex-row gap-2">
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

          <button
            onClick={handleSave}
            className="w-full bg-neutral-300 text-black font-bold py-3 rounded-lg hover:bg-neutral-200 transition mt-2 cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      </div>
    </>
  );
}
